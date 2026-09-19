import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const sql = postgres(Deno.env.get("SUPABASE_DB_URL") ?? "", { max: 1 });
const META_API_VERSION = "v26.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

async function getEncryptionKey(): Promise<CryptoKey> {
  const rows = await sql`
    select decrypted_secret
    from vault.decrypted_secrets
    where name = 'abos_whatsapp_encryption_key'
    limit 1
  `;
  const secret = rows[0]?.decrypted_secret;
  if (!secret) throw new Error("ABOS WhatsApp encryption key is not configured");
  const bytes = fromBase64(secret);
  if (bytes.length !== 32) throw new Error("ABOS WhatsApp encryption key must be 32 bytes");
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["decrypt"]);
}

async function decryptToken(packedValue: string): Promise<string> {
  const key = await getEncryptionKey();
  const packed = fromBase64(packedValue);
  if (packed.length < 13) throw new Error("Invalid encrypted WhatsApp token");
  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await supabase.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { conversationId, content } = await req.json();
    const normalizedContent = typeof content === "string" ? content.trim() : "";

    if (!conversationId || !normalizedContent || normalizedContent.length > 4096) {
      return json({ error: "Invalid message payload" }, 400);
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id,business_id,customer_phone,customer_name,channel")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversation) return json({ error: "Conversation not found" }, 404);
    if (conversation.channel !== "whatsapp") return json({ error: "Conversation is not a WhatsApp conversation" }, 400);
    if (!conversation.customer_phone) return json({ error: "Conversation has no customer phone number" }, 400);

    const { data: membership } = await supabase
      .from("business_memberships")
      .select("id")
      .eq("business_id", conversation.business_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return json({ error: "Forbidden" }, 403);

    const rows = await sql`
      select phone_number_id, encrypted_access_token, status
      from private.whatsapp_connections
      where business_id = ${conversation.business_id}
      limit 1
    `;

    const connection = rows[0];
    if (!connection || connection.status !== "connected") {
      return json({ error: "WhatsApp is not connected. Connect it in Settings first." }, 400);
    }

    const accessToken = await decryptToken(connection.encrypted_access_token);
    const recipient = String(conversation.customer_phone).replace(/^\+/, "");

    const response = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${connection.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: { body: normalizedContent },
        }),
      },
    );

    const metaData = await response.json().catch(() => ({}));
    if (!response.ok) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        business_id: conversation.business_id,
        direction: "outgoing",
        channel: "whatsapp",
        content: normalizedContent,
        status: "failed",
        error_code: String(metaData?.error?.code ?? "META_ERROR"),
        error_message: metaData?.error?.message ?? "Meta rejected the message",
      });
      return json({ error: "Meta rejected the message", details: metaData?.error?.message ?? "Unknown Meta error" }, 502);
    }

    const waMessageId = metaData?.messages?.[0]?.id ?? null;
    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      business_id: conversation.business_id,
      direction: "outgoing",
      channel: "whatsapp",
      content: normalizedContent,
      wa_message_id: waMessageId,
      status: "sent",
    });

    if (insertError) throw insertError;

    await supabase.from("conversations").update({
      last_message_preview: normalizedContent,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);

    return json({ success: true, wa_message_id: waMessageId });
  } catch (error) {
    console.error("whatsapp-send error:", error);
    return json({ error: "Internal server error" }, 500);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
});
