import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

// whatsapp-send v8
// - Role check: only owner / admin / agent may send (viewers are read-only).
// - One short-lived DB connection per request (the old module-level client was closed in `finally`).
// - Instant send: the message row is inserted first (status "sending", keyed by client_id) so
//   Realtime shows it at once; the same row is then updated to sent / failed.
// - Idempotent on (conversation_id, client_id): a double tap or a retry never sends twice.
// - 24-hour customer-service window is checked before any free-form text is sent.

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const META_API_VERSION = "v26.0";
const SEND_ROLES = new Set(["owner", "admin", "agent"]);
const WINDOW_MS = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

class SendError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fromBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await supabase.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

// Opens its own DB connection and always closes it, so a warm instance can serve the next request.
async function loadConnection(businessId: string) {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL") ?? "", { max: 1 });
  try {
    const rows = await sql`
      select phone_number_id, encrypted_access_token, status
      from private.whatsapp_connections
      where business_id = ${businessId}
      limit 1
    `;
    const connection = rows[0];
    if (!connection || connection.status !== "connected") {
      throw new SendError("NOT_CONNECTED", "WhatsApp is not connected. Connect it in Settings first.", 400);
    }

    const keyRows = await sql`
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'abos_whatsapp_encryption_key'
      limit 1
    `;
    const secret = keyRows[0]?.decrypted_secret;
    if (!secret) throw new SendError("CONFIG", "WhatsApp encryption key is not configured", 500);
    const keyBytes = fromBase64(secret);
    if (keyBytes.length !== 32) throw new SendError("CONFIG", "WhatsApp encryption key must be 32 bytes", 500);

    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    const packed = fromBase64(connection.encrypted_access_token);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: packed.slice(0, 12) },
      key,
      packed.slice(12),
    );
    return {
      phoneNumberId: String(connection.phone_number_id),
      accessToken: new TextDecoder().decode(plaintext),
    };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

async function markFailed(messageId: string, code: string, message: string) {
  const { error } = await supabase
    .from("messages")
    .update({ status: "failed", error_code: code.slice(0, 64), error_message: message.slice(0, 500) })
    .eq("id", messageId);
  if (error) console.error("whatsapp-send: could not mark message failed:", error.message);
}

Deno.serve(async (req: Request) => {
  let messageId: string | null = null;
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid message payload" }, 400);
    }

    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const rawClientId = body.clientId;

    if (!UUID_RE.test(conversationId) || !content || content.length > 4096) {
      return json({ error: "Invalid message payload" }, 400);
    }
    if (rawClientId !== undefined && rawClientId !== null && (typeof rawClientId !== "string" || !UUID_RE.test(rawClientId))) {
      return json({ error: "Invalid clientId" }, 400);
    }
    const clientId = typeof rawClientId === "string" ? rawClientId.toLowerCase() : crypto.randomUUID();

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id,business_id,customer_phone,channel")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversation) return json({ error: "Conversation not found" }, 404);

    // Membership and role. A non-member gets the same answer as a missing conversation.
    const { data: membership } = await supabase
      .from("business_memberships")
      .select("role")
      .eq("business_id", conversation.business_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return json({ error: "Conversation not found" }, 404);
    if (!SEND_ROLES.has(String(membership.role))) {
      return json({ error: "Your role cannot send messages", code: "ROLE_FORBIDDEN" }, 403);
    }

    if (conversation.channel !== "whatsapp") return json({ error: "Conversation is not a WhatsApp conversation" }, 400);
    if (!conversation.customer_phone) return json({ error: "Conversation has no customer phone number" }, 400);

    // Free-form text is only allowed within 24 hours of the customer's last message.
    const { data: lastIncoming } = await supabase
      .from("messages")
      .select("created_at")
      .eq("conversation_id", conversationId)
      .eq("direction", "incoming")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastIncoming?.created_at || Date.now() - new Date(lastIncoming.created_at).getTime() > WINDOW_MS) {
      return json({
        error: "The 24-hour WhatsApp window is closed. The customer must message first, or an approved template is needed.",
        code: "WINDOW_CLOSED",
      }, 409);
    }

    // Insert first (idempotent on client_id) so every open screen sees the bubble immediately.
    const inserted = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        business_id: conversation.business_id,
        direction: "outgoing",
        channel: "whatsapp",
        content,
        status: "sending",
        client_id: clientId,
        metadata: { source: "owner", sent_by: user.id },
      })
      .select("id")
      .single();

    if (inserted.error) {
      if (inserted.error.code !== "23505") throw inserted.error;

      // Same clientId seen before: double tap or a retry.
      const existing = await supabase
        .from("messages")
        .select("id,status,wa_message_id")
        .eq("conversation_id", conversationId)
        .eq("client_id", clientId)
        .maybeSingle();
      if (existing.error || !existing.data) return json({ error: "Duplicate request", code: "DUPLICATE" }, 409);

      const status = String(existing.data.status);
      if (status === "sent" || status === "delivered" || status === "read") {
        return json({ success: true, duplicate: true, message_id: existing.data.id, wa_message_id: existing.data.wa_message_id, status });
      }
      if (status !== "failed") {
        return json({ error: "This message is already being sent", code: "IN_PROGRESS" }, 409);
      }

      // Retry of a failed message: claim it atomically so two retries cannot both send.
      const claimed = await supabase
        .from("messages")
        .update({ status: "sending", error_code: null, error_message: null })
        .eq("id", existing.data.id)
        .eq("status", "failed")
        .select("id")
        .maybeSingle();
      if (claimed.error || !claimed.data) return json({ error: "This message is already being sent", code: "IN_PROGRESS" }, 409);
      messageId = claimed.data.id;
    } else {
      messageId = inserted.data.id;
    }

    let connection: { phoneNumberId: string; accessToken: string };
    try {
      connection = await loadConnection(conversation.business_id);
    } catch (error) {
      if (error instanceof SendError) {
        await markFailed(messageId!, error.code, error.message);
        return json({ error: error.message, code: error.code, message_id: messageId }, error.status);
      }
      throw error;
    }

    const recipient = String(conversation.customer_phone).replace(/^\+/, "");

    let response: Response;
    try {
      response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${connection.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipient,
            type: "text",
            text: { body: content },
          }),
          signal: AbortSignal.timeout(20000),
        },
      );
    } catch (_networkError) {
      await markFailed(messageId!, "META_NETWORK", "Could not reach WhatsApp. Check the connection and retry.");
      return json({ error: "Could not reach WhatsApp", code: "META_NETWORK", message_id: messageId }, 502);
    }

    const metaData = await response.json().catch(() => ({}));
    if (!response.ok) {
      const metaMessage = String(metaData?.error?.message ?? "Meta rejected the message");
      await markFailed(messageId!, String(metaData?.error?.code ?? "META_ERROR"), metaMessage);
      return json({ error: "Meta rejected the message", details: metaMessage, message_id: messageId }, 502);
    }

    const waMessageId = metaData?.messages?.[0]?.id ?? null;

    const sent = await supabase
      .from("messages")
      .update({ status: "sent", wa_message_id: waMessageId, error_code: null, error_message: null })
      .eq("id", messageId);
    if (sent.error) console.error("whatsapp-send: message was delivered to Meta but the row update failed:", sent.error.message);

    const touch = await supabase.from("conversations").update({
      last_message_preview: content,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);
    if (touch.error) console.error("whatsapp-send: could not update conversation preview:", touch.error.message);

    return json({ success: true, message_id: messageId, wa_message_id: waMessageId, status: "sent" });
  } catch (error) {
    console.error("whatsapp-send error:", error instanceof Error ? error.message : error);
    if (messageId) await markFailed(messageId, "INTERNAL", "Internal error while sending");
    return json({ error: "Internal server error", message_id: messageId }, 500);
  }
});
