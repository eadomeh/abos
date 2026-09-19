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

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
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
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt"]);
}

async function encryptToken(token: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token)),
  );
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);
  return toBase64(packed);
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await supabase.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

async function metaGet(path: string, accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const action = body?.action;

    if (action === "status") {
      const businessId = String(body?.businessId ?? "");
      if (!businessId) return json({ error: "businessId is required" }, 400);

      const { data: membership } = await supabase
        .from("business_memberships")
        .select("id")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) return json({ error: "Forbidden" }, 403);

      const rows = await sql`
        select business_id, phone_number_id, waba_id, display_phone_number,
               verified_name, quality_rating, status, last_verified_at,
               connected_at
        from private.whatsapp_connections
        where business_id = ${businessId}
        limit 1
      `;

      return json({ connected: Boolean(rows[0]), connection: rows[0] ?? null });
    }

    if (action === "disconnect") {
      const businessId = String(body?.businessId ?? "");
      if (!businessId) return json({ error: "businessId is required" }, 400);

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", businessId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!business) return json({ error: "Only the business owner can disconnect WhatsApp" }, 403);

      await sql`delete from private.whatsapp_connections where business_id = ${businessId}`;

      const { error } = await supabase
        .from("businesses")
        .update({
          whatsapp_phone_number_id: null,
          whatsapp_waba_id: null,
          whatsapp_connected_at: null,
          whatsapp_business_name: null,
          whatsapp_verify_token: null,
        })
        .eq("id", businessId);

      if (error) throw error;
      return json({ success: true, connected: false });
    }

    if (action === "connect") {
      const businessId = String(body?.businessId ?? "");
      const phoneNumberId = String(body?.phoneNumberId ?? "").trim();
      const wabaId = String(body?.wabaId ?? "").trim();
      const accessToken = String(body?.accessToken ?? "").trim();

      if (!businessId || !phoneNumberId || !wabaId || !accessToken) {
        return json({ error: "businessId, phoneNumberId, wabaId and accessToken are required" }, 400);
      }

      if (!/^\d+$/.test(phoneNumberId) || !/^\d+$/.test(wabaId)) {
        return json({ error: "Phone Number ID and WABA ID must be numeric Meta IDs" }, 400);
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", businessId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!business) return json({ error: "Only the business owner can connect WhatsApp" }, 403);

      const phoneInfo = await metaGet(
        `${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
        accessToken,
      );

      if (!phoneInfo.response.ok || phoneInfo.data?.id !== phoneNumberId) {
        return json({
          error: "Meta rejected the WhatsApp credentials",
          details: phoneInfo.data?.error?.message ?? "Could not verify Phone Number ID",
        }, 400);
      }

      const wabaPhones = await metaGet(
        `${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`,
        accessToken,
      );

      if (!wabaPhones.response.ok) {
        return json({
          error: "Could not verify the WhatsApp Business Account",
          details: wabaPhones.data?.error?.message ?? "Meta rejected the WABA credentials",
        }, 400);
      }

      const matchingPhone = (wabaPhones.data?.data ?? []).find(
        (phone: { id?: string }) => phone.id === phoneNumberId,
      );

      if (!matchingPhone) {
        return json({ error: "The Phone Number ID does not belong to the supplied WhatsApp Business Account" }, 400);
      }

      const encryptedToken = await encryptToken(accessToken);

      await sql.begin(async (transaction) => {
        await transaction`
          insert into private.whatsapp_connections
            (business_id, phone_number_id, waba_id, encrypted_access_token,
             display_phone_number, verified_name, quality_rating, status,
             last_verified_at, connected_at)
          values
            (${businessId}, ${phoneNumberId}, ${wabaId}, ${encryptedToken},
             ${phoneInfo.data?.display_phone_number ?? matchingPhone?.display_phone_number ?? null},
             ${phoneInfo.data?.verified_name ?? matchingPhone?.verified_name ?? null},
             ${phoneInfo.data?.quality_rating ?? matchingPhone?.quality_rating ?? null},
             'connected', now(), now())
          on conflict (business_id) do update set
            phone_number_id = excluded.phone_number_id,
            waba_id = excluded.waba_id,
            encrypted_access_token = excluded.encrypted_access_token,
            display_phone_number = excluded.display_phone_number,
            verified_name = excluded.verified_name,
            quality_rating = excluded.quality_rating,
            status = 'connected',
            last_verified_at = now(),
            connected_at = now(),
            updated_at = now()
        `;

        await transaction`
          update public.businesses
          set whatsapp_phone_number_id = ${phoneNumberId},
              whatsapp_waba_id = ${wabaId},
              whatsapp_business_name = ${phoneInfo.data?.verified_name ?? matchingPhone?.verified_name ?? null},
              whatsapp_connected_at = now(),
              whatsapp_verify_token = null
          where id = ${businessId}
        `;
      });

      return json({
        success: true,
        connected: true,
        connection: {
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
          display_phone_number: phoneInfo.data?.display_phone_number ?? matchingPhone?.display_phone_number ?? null,
          verified_name: phoneInfo.data?.verified_name ?? matchingPhone?.verified_name ?? null,
          quality_rating: phoneInfo.data?.quality_rating ?? matchingPhone?.quality_rating ?? null,
          status: "connected",
        },
      });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error("whatsapp-connection error:", error);
    return json({ error: "Internal server error" }, 500);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
});
