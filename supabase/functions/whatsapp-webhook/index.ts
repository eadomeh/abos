import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Hub-Signature-256",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: { phone_number_id: string; display_phone_number: string };
      contacts?: Array<{ wa_id: string; profile: { name: string } }>;
      messages?: Array<{
        id: string;
        from: string;
        type: string;
        text?: { body: string };
        timestamp: string;
      }>;
      statuses?: Array<{
        id: string;
        status: string;
        recipient_id: string;
        timestamp: string;
        errors?: Array<{ code: string; title: string }>;
      }>;
    };
    field: string;
  }>;
}

interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyMetaSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const appSecret = Deno.env.get("META_APP_SECRET");
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return false;

  const suppliedHex = signatureHeader.slice("sha256=".length);
  if (!/^[0-9a-f]{64}$/i.test(suppliedHex)) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)),
  );
  return constantTimeEqual(digest, hexToBytes(suppliedHex));
}

async function claimWebhookEvent(
  businessId: string,
  waEventId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("whatsapp_webhook_events")
    .upsert(
      {
        business_id: businessId,
        wa_event_id: waEventId,
        event_type: eventType,
        payload,
        processed: false,
      },
      { onConflict: "wa_event_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Webhook event claim failed:", error);
    throw new Error("Could not claim webhook event");
  }

  return Boolean(data?.id);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const challenge = url.searchParams.get("hub.challenge");
      const providedToken = url.searchParams.get("hub.verify_token");
      const configuredToken = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN");

      if (mode !== "subscribe" || !providedToken || !challenge || !configuredToken) {
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }

      const isValid = constantTimeEqual(
        new TextEncoder().encode(providedToken),
        new TextEncoder().encode(configuredToken),
      );

      return isValid
        ? new Response(challenge, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } })
        : new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const rawBody = await req.text();
    const signatureValid = await verifyMetaSignature(rawBody, req.headers.get("X-Hub-Signature-256"));
    if (!signatureValid) {
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody) as MetaWebhookPayload;

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("id, whatsapp_phone_number_id")
          .eq("whatsapp_phone_number_id", phoneNumberId)
          .maybeSingle();

        if (businessError) throw businessError;
        if (!business) continue;

        for (const msg of value.messages ?? []) {
          const claimed = await claimWebhookEvent(
            business.id,
            msg.id,
            "message",
            { msg, metadata: value.metadata },
          );
          if (!claimed) continue;

          const textContent = msg.type === "text" && msg.text?.body
            ? msg.text.body
            : `[${msg.type} message]`;
          const customerPhone = `+${msg.from}`;
          const contact = value.contacts?.find((c) => c.wa_id === msg.from);
          const customerName = contact?.profile?.name ?? customerPhone;

          const { data: existingConvo, error: convoLookupError } = await supabase
            .from("conversations")
            .select("id")
            .eq("business_id", business.id)
            .eq("channel", 'whatsapp')
            .eq("customer_phone", customerPhone)
            .maybeSingle();

          if (convoLookupError) throw convoLookupError;

          let conversationId = existingConvo?.id;

          if (!conversationId) {
            const { data: existingCustomer, error: customerError } = await supabase
              .from("customers")
              .select("id, name")
              .eq("business_id", business.id)
              .eq("phone", customerPhone)
              .maybeSingle();
            if (customerError) throw customerError;

            const { data: newConvo, error: newConvoError } = await supabase
              .from("conversations")
              .insert({
                business_id: business.id,
                customer_id: existingCustomer?.id ?? null,
                customer_name: existingCustomer?.name ?? customerName,
                customer_phone: customerPhone,
                channel: 'whatsapp',
                external_thread_id: customerPhone,
                last_message_preview: textContent,
                last_message_at: new Date().toISOString(),
                unread_count: 1,
              })
              .select("id")
              .maybeSingle();

            if (newConvoError) throw newConvoError;
            if (!newConvo) continue;
            conversationId = newConvo.id;
          }

          const { error: messageError } = await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              business_id: business.id,
              direction: "incoming",
              channel: 'whatsapp',
              content: textContent,
              metadata: { provider: 'meta', message_type: msg.type },
              wa_message_id: msg.id,
              status: "delivered",
            });
          if (messageError) throw messageError;

          const { error: convoUpdateError } = await supabase
            .from("conversations")
            .update({
              last_message_preview: textContent,
              last_message_at: new Date().toISOString(),
              unread_count: 1,
            })
            .eq("id", conversationId);
          if (convoUpdateError) throw convoUpdateError;

          await supabase
            .from("whatsapp_webhook_events")
            .update({ processed: true })
            .eq("wa_event_id", msg.id);
        }

        for (const statusUpdate of value.statuses ?? []) {
          const statusEventId = `status:${statusUpdate.id}:${statusUpdate.status}:${statusUpdate.timestamp}`;
          const claimed = await claimWebhookEvent(
            business.id,
            statusEventId,
            "status",
            { status: statusUpdate },
          );
          if (!claimed) continue;

          if (["sent", "delivered", "read", "failed"].includes(statusUpdate.status)) {
            const updateData: Record<string, string> = { status: statusUpdate.status };
            if (statusUpdate.status === "failed" && statusUpdate.errors?.[0]) {
              updateData.error_code = statusUpdate.errors[0].code;
              updateData.error_message = statusUpdate.errors[0].title;
            }

            const { error: statusError } = await supabase
              .from("messages")
              .update(updateData)
              .eq("business_id", business.id)
              .eq("wa_message_id", statusUpdate.id);
            if (statusError) throw statusError;
          }

          await supabase
            .from("whatsapp_webhook_events")
            .update({ processed: true })
            .eq("wa_event_id", statusEventId);
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
