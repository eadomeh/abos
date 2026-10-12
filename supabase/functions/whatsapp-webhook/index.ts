import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

declare const EdgeRuntime: { waitUntil?: (promise: Promise<unknown>) => void } | undefined;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const META_API_VERSION = "v26.0";
const HOLDING_REPLY = "Sorry, give me a moment and I'll get back to you shortly.";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// One short-lived DB connection per use; never share a module-level client that a
// finally-block could close underneath a background task or a later request.
function newSql() {
  return postgres(Deno.env.get("SUPABASE_DB_URL") ?? "", { max: 1 });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function bytes(value: string) { return new TextEncoder().encode(value); }
function equalBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}
function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function fromBase64(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}
function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function getVerifyToken() {
  const sql = newSql();
  try {
    const rows = await sql.unsafe("select decrypted_secret from vault.decrypted_secrets where name = 'abos_whatsapp_webhook_verify_token' limit 1");
    return rows[0]?.decrypted_secret ?? null;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

async function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = Deno.env.get("META_APP_SECRET");
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return false;
  const supplied = signatureHeader.slice(7);
  if (!/^[0-9a-f]{64}$/i.test(supplied)) return false;
  const key = await crypto.subtle.importKey("raw", bytes(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, bytes(rawBody)));
  return equalBytes(digest, hexToBytes(supplied));
}

async function claimEvent(businessId: string, eventId: string, eventType: string, payload: unknown) {
  const result = await supabase.from("whatsapp_webhook_events").upsert(
    { business_id: businessId, wa_event_id: eventId, event_type: eventType, payload, processed: false },
    { onConflict: "wa_event_id", ignoreDuplicates: true },
  ).select("id").maybeSingle();
  if (result.error) throw result.error;
  return Boolean(result.data?.id);
}

type SendResult =
  | { ok: true; waMessageId: string | null }
  | { ok: false; code: string; message: string };

// Sends a plain text WhatsApp message with the business's stored (encrypted) access token.
async function sendWhatsAppText(
  sql: ReturnType<typeof newSql>,
  businessId: string,
  customerPhone: string,
  body: string,
): Promise<SendResult> {
  const rows = await sql`
    select phone_number_id, encrypted_access_token, status
    from private.whatsapp_connections
    where business_id = ${businessId}
    limit 1
  `;
  const connection = rows[0];
  if (!connection || connection.status !== "connected") {
    return { ok: false, code: "NOT_CONNECTED", message: "WhatsApp is not connected for this business" };
  }

  const keyRows = await sql`select decrypted_secret from vault.decrypted_secrets where name = 'abos_whatsapp_encryption_key' limit 1`;
  const keyB64 = keyRows[0]?.decrypted_secret;
  if (!keyB64) throw new Error("WhatsApp encryption key is not configured");
  const key = await crypto.subtle.importKey("raw", fromBase64(keyB64), { name: "AES-GCM" }, false, ["decrypt"]);
  const packed = fromBase64(connection.encrypted_access_token);
  const accessToken = new TextDecoder().decode(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: packed.slice(0, 12) }, key, packed.slice(12)),
  );

  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${connection.phone_number_id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: customerPhone.replace(/^\+/, ""),
      type: "text",
      text: { body },
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      code: String(data?.error?.code ?? "META_ERROR"),
      message: data?.error?.message ?? "Meta rejected the message",
    };
  }
  return { ok: true, waMessageId: data?.messages?.[0]?.id ?? null };
}

/**
 * AI-001 / WA-002: answer an inbound customer text through the shared ABOS brain
 * (abos-ai-agent) and send the answer back over WhatsApp. Runs in the background so
 * the webhook can acknowledge Meta immediately. Kill switch: set the Edge Function
 * secret ABOS_WHATSAPP_AUTOREPLY to "off".
 *
 * Reliability: the agent already walks a chain of models. If it still cannot answer, this
 * asks it again after a pause. Only when both attempts fail does the customer get a short
 * holding reply, and the owner gets a high-priority task so a human picks the chat up.
 */
async function autoReply(params: {
  businessId: string;
  conversationId: string;
  messageId: string;
  customerPhone: string;
  customerId: string | null;
  customerName: string;
  text: string;
}) {
  const { businessId, conversationId, messageId, customerPhone, customerId, customerName, text } = params;
  const sql = newSql();
  try {
    let agent: Record<string, unknown> | null = null;
    let heldReply: string | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (attempt > 0) await sleep(10000);

      let data: Record<string, unknown> = {};
      let usable = false;
      try {
        const agentResponse = await fetch(`${SUPABASE_URL}/functions/v1/abos-ai-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-abos-internal-key": Deno.env.get("ABOS_INTERNAL_KEY") || SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            business_id: businessId,
            conversation_id: conversationId,
            message_id: messageId,
            message: text,
            trigger: "whatsapp",
            audience: "customer",
          }),
          signal: AbortSignal.timeout(75000),
        });
        data = await agentResponse.json().catch(() => ({}));
        usable = agentResponse.ok && typeof data?.answer === "string";
      } catch (error) {
        console.error("autoReply: agent call failed", error instanceof Error ? error.message : error);
      }

      if (usable && !data.fallback) {
        agent = data;
        break;
      }
      if (usable && data.fallback) heldReply = String(data.answer);
      console.error("autoReply: attempt " + (attempt + 1) + " gave no answer");
    }

    // The agent already answered this exact message once; do not send twice.
    if (agent?.deduplicated) return;

    const isFallback = !agent;
    const answer = String(agent ? agent.answer : (heldReply ?? HOLDING_REPLY)).trim().slice(0, 4000);
    if (!answer) return;

    const metadata = {
      source: "ai_agent",
      run_id: (agent?.run_id as string | undefined) ?? null,
      ...(isFallback ? { fallback: true } : {}),
    };

    const sent = await sendWhatsAppText(sql, businessId, customerPhone, answer);

    if (!sent.ok) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        business_id: businessId,
        direction: "outgoing",
        channel: "whatsapp",
        content: answer,
        status: "failed",
        error_code: sent.code,
        error_message: sent.message,
        metadata,
      });
      console.error("autoReply: could not send reply:", sent.message);
      return;
    }

    const inserted = await supabase.from("messages").insert({
      conversation_id: conversationId,
      business_id: businessId,
      direction: "outgoing",
      channel: "whatsapp",
      content: answer,
      wa_message_id: sent.waMessageId,
      status: "sent",
      metadata,
    });
    if (inserted.error) throw inserted.error;

    await supabase.from("conversations").update({
      last_message_preview: answer,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);

    // The customer only got a holding reply: make sure a human sees it.
    if (isFallback) {
      const task = await supabase.from("tasks").insert({
        business_id: businessId,
        title: "Reply to " + customerName + ": the AI could not answer",
        description:
          "The customer wrote: \"" + text.slice(0, 300) + "\". The AI was unavailable, so only a holding reply was sent. Please answer them from Conversations.",
        priority: "high",
        related_customer_id: customerId,
      });
      if (task.error) console.error("autoReply: could not create owner task:", task.error.message);
    }
  } catch (error) {
    console.error("autoReply error:", error instanceof Error ? error.message : error);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204 });
    if (req.method === "GET") {
      const params = new URL(req.url).searchParams;
      const token = await getVerifyToken();
      const mode = params.get("hub.mode");
      const challenge = params.get("hub.challenge");
      const provided = params.get("hub.verify_token");
      if (!token || !provided || mode !== "subscribe" || !challenge) return new Response("Forbidden", { status: 403 });
      return equalBytes(bytes(provided), bytes(token)) ? new Response(challenge, { status: 200 }) : new Response("Forbidden", { status: 403 });
    }
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const rawBody = await req.text();
    if (!await verifyMetaSignature(rawBody, req.headers.get("X-Hub-Signature-256"))) {
      return json({ error: "Invalid webhook signature" }, 401);
    }

    const payload = JSON.parse(rawBody);
    if (payload.object !== "whatsapp_business_account") return json({ status: "ignored" });

    const autoReplyEnabled = (Deno.env.get("ABOS_WHATSAPP_AUTOREPLY") ?? "on").toLowerCase() !== "off";

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const businessResult = await supabase.from("businesses").select("id").eq("whatsapp_phone_number_id", phoneNumberId).maybeSingle();
        if (businessResult.error) throw businessResult.error;
        const business = businessResult.data;
        if (!business) continue;

        for (const msg of value.messages ?? []) {
          if (!msg?.id) continue;
          if (!await claimEvent(business.id, msg.id, "message", { msg, metadata: value.metadata })) continue;

          const customerPhone = "+" + msg.from;
          const contact = (value.contacts ?? []).find((item: { wa_id?: string }) => item.wa_id === msg.from);
          const customerName = contact?.profile?.name ?? customerPhone;
          const isText = msg.type === "text" && Boolean(msg.text?.body);
          const content = isText ? msg.text.body : "[" + String(msg.type ?? "unsupported") + " message]";

          const customerResult = await supabase.from("customers").select("id,name").eq("business_id", business.id).eq("phone", customerPhone).maybeSingle();
          if (customerResult.error) throw customerResult.error;
          let customerId = customerResult.data?.id ?? null;
          let canonicalName = customerResult.data?.name ?? customerName;

          if (!customerId) {
            const created = await supabase.from("customers").insert({ business_id: business.id, name: customerName, phone: customerPhone }).select("id,name").maybeSingle();
            if (created.error) throw created.error;
            customerId = created.data?.id ?? null;
            canonicalName = created.data?.name ?? customerName;
          }

          const convoResult = await supabase.from("conversations").select("id").eq("business_id", business.id).eq("channel", "whatsapp").eq("customer_phone", customerPhone).maybeSingle();
          if (convoResult.error) throw convoResult.error;
          let conversationId = convoResult.data?.id ?? null;

          if (!conversationId) {
            const createdConvo = await supabase.from("conversations").insert({
              business_id: business.id,
              customer_id: customerId,
              customer_name: canonicalName,
              customer_phone: customerPhone,
              channel: "whatsapp",
              external_thread_id: customerPhone,
              last_message_preview: content,
              last_message_at: new Date().toISOString(),
              unread_count: 1,
            }).select("id").maybeSingle();
            if (createdConvo.error) throw createdConvo.error;
            conversationId = createdConvo.data?.id ?? null;
          }

          if (!conversationId) continue;

          const inserted = await supabase.from("messages").insert({
            conversation_id: conversationId,
            business_id: business.id,
            direction: "incoming",
            channel: "whatsapp",
            content,
            metadata: { provider: "meta", message_type: msg.type },
            wa_message_id: msg.id,
            status: "delivered",
          }).select("id").single();
          if (inserted.error) throw inserted.error;

          const updated = await supabase.from("conversations").update({
            last_message_preview: content,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }).eq("id", conversationId);
          if (updated.error) throw updated.error;

          await supabase.from("whatsapp_webhook_events").update({ processed: true }).eq("wa_event_id", msg.id);

          // Text only for now; image and voice arrive with the multimodal tasks.
          if (autoReplyEnabled && isText) {
            const task = autoReply({
              businessId: business.id,
              conversationId,
              messageId: inserted.data.id,
              customerPhone,
              customerId,
              customerName: canonicalName,
              text: msg.text.body,
            });
            if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
              EdgeRuntime.waitUntil(task);
            } else {
              await task;
            }
          }
        }

        for (const statusUpdate of value.statuses ?? []) {
          if (!statusUpdate?.id || !statusUpdate?.status) continue;
          const eventId = "status:" + statusUpdate.id + ":" + statusUpdate.status + ":" + String(statusUpdate.timestamp ?? "");
          if (!await claimEvent(business.id, eventId, "status", { status: statusUpdate })) continue;

          if (["sent", "delivered", "read", "failed"].includes(statusUpdate.status)) {
            const updateData: Record<string, string> = { status: statusUpdate.status };
            if (statusUpdate.status === "failed" && statusUpdate.errors?.[0]) {
              updateData.error_code = String(statusUpdate.errors[0].code ?? "META_ERROR");
              updateData.error_message = String(statusUpdate.errors[0].title ?? "Meta message error");
            }
            const statusResult = await supabase.from("messages").update(updateData).eq("business_id", business.id).eq("wa_message_id", statusUpdate.id);
            if (statusResult.error) throw statusResult.error;
          }

          await supabase.from("whatsapp_webhook_events").update({ processed: true }).eq("wa_event_id", eventId);
        }
      }
    }

    return json({ status: "ok" });
  } catch (error) {
    console.error("whatsapp-webhook error:", error);
    return json({ error: "Webhook processing failed" }, 500);
  }
});
