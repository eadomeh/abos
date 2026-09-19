import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
const sql = postgres(Deno.env.get("SUPABASE_DB_URL") ?? "", { max: 1 });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Hub-Signature-256",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
async function getVerifyToken() {
  const rows = await sql.unsafe(
    "select decrypted_secret from vault.decrypted_secrets where name = 'abos_whatsapp_webhook_verify_token' limit 1",
  );
  return rows[0]?.decrypted_secret ?? null;
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

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

    if (req.method === "GET") {
      const params = new URL(req.url).searchParams;
      const token = await getVerifyToken();
      const mode = params.get("hub.mode");
      const challenge = params.get("hub.challenge");
      const provided = params.get("hub.verify_token");
      if (!token || !provided || mode !== "subscribe" || !challenge) return new Response("Forbidden", { status: 403, headers: corsHeaders });
      return equalBytes(bytes(provided), bytes(token))
        ? new Response(challenge, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } })
        : new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const rawBody = await req.text();
    if (!await verifyMetaSignature(rawBody, req.headers.get("X-Hub-Signature-256"))) {
      return json({ error: "Invalid webhook signature" }, 401);
    }

    const payload = JSON.parse(rawBody);
    if (payload.object !== "whatsapp_business_account") return json({ status: "ignored" });

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
          const content = msg.type === "text" && msg.text?.body ? msg.text.body : "[" + String(msg.type ?? "unsupported") + " message]";

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
          });
          if (inserted.error) throw inserted.error;

          const updated = await supabase.from("conversations").update({
            last_message_preview: content,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }).eq("id", conversationId);
          if (updated.error) throw updated.error;

          await supabase.from("whatsapp_webhook_events").update({ processed: true }).eq("wa_event_id", msg.id);
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
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
});
