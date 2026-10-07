import { createClient } from "npm:@supabase/supabase-js@2.57.4";

import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL") ?? "", { max: 1 });

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
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
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

export async function decryptToken(packedValue: string): Promise<string> {
  const key = await getEncryptionKey();
  const packed = fromBase64(packedValue);
  if (packed.length < 13) throw new Error("Invalid encrypted WhatsApp token");
  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

export async function closeSql(): Promise<void> {
  await sql.end({ timeout: 5 });
}


const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

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

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}

async function metaGet(path: string, accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function metaPost(path: string, accessToken: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

/**
 * SET-004: Exchange a short-lived Embedded Signup authorization code for a
 * business access token. Server-side only — META_APP_SECRET never leaves
 * the Edge Function environment. The resulting token is never returned to
 * the browser; it is verified, encrypted and persisted server-side.
 */
async function exchangeCodeForToken(code: string): Promise<
  { accessToken: string } | { error: string; details?: string }
> {
  const appId = Deno.env.get("META_APP_ID") ?? "";
  const appSecret = Deno.env.get("META_APP_SECRET") ?? "";

  if (!appId || !appSecret) {
    return {
      error: "Meta server configuration is incomplete",
      details: "META_APP_ID or META_APP_SECRET is missing from Edge Function secrets",
    };
  }

  const url = new URL(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.access_token) {
    return {
      error: "Meta rejected the authorization code",
      details: data?.error?.message ?? "Code exchange failed",
    };
  }

  return { accessToken: data.access_token as string };
}

/**
 * Verify the phone/WABA pair, subscribe the WABA to webhooks, encrypt and
 * persist the credential, and update the public business record.
 * Shared by the legacy "connect" action and the SET-004 exchange flow.
 */
async function finalizeConnection(params: {
  businessId: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
}): Promise<{ ok: true; connection: Record<string, unknown> } | { ok: false; error: string; details?: string }> {
  const { businessId, phoneNumberId, wabaId, accessToken } = params;

  const phoneInfo = await metaGet(
    `${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
    accessToken,
  );

  if (!phoneInfo.response.ok || phoneInfo.data?.id !== phoneNumberId) {
    return {
      ok: false,
      error: "Meta rejected the WhatsApp credentials",
      details: phoneInfo.data?.error?.message ?? "Could not verify Phone Number ID",
    };
  }

  const wabaPhones = await metaGet(
    `${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`,
    accessToken,
  );

  if (!wabaPhones.response.ok) {
    return {
      ok: false,
      error: "Could not verify the WhatsApp Business Account",
      details: wabaPhones.data?.error?.message ?? "Meta rejected the WABA credentials",
    };
  }

  const matchingPhone = (wabaPhones.data?.data ?? []).find((p: { id?: string }) => p.id === phoneNumberId);
  if (!matchingPhone) {
    return {
      ok: false,
      error: "The Phone Number ID does not belong to the supplied WhatsApp Business Account",
    };
  }

  // SET-006: subscribe the WABA so Meta delivers webhook events to ABOS.
  // Tolerate failure here (e.g. already subscribed) but report it.
  const subscribe = await metaPost(`${wabaId}/subscribed_apps`, accessToken);
  const webhookSubscribed = subscribe.response.ok && subscribe.data?.success === true;

  const encryptedToken = await encryptToken(accessToken);
  await sql.begin(async (transaction: typeof sql) => {
    await transaction`
      insert into private.whatsapp_connections
        (business_id, phone_number_id, waba_id, encrypted_access_token,
         display_phone_number, verified_name, quality_rating, status, last_verified_at, connected_at)
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
          whatsapp_connected_at = now()
      where id = ${businessId}
    `;
  });

  return {
    ok: true,
    connection: {
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      display_phone_number: phoneInfo.data?.display_phone_number ?? matchingPhone?.display_phone_number ?? null,
      verified_name: phoneInfo.data?.verified_name ?? matchingPhone?.verified_name ?? null,
      quality_rating: phoneInfo.data?.quality_rating ?? matchingPhone?.quality_rating ?? null,
      status: "connected",
      webhook_subscribed: webhookSubscribed,
    },
  };
}

async function assertOwner(businessId: string, userId: string): Promise<boolean> {
  const business = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .maybeSingle();
  return Boolean(business.data);
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

      const membership = await supabase
        .from("business_memberships")
        .select("id, role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership.data) return json({ error: "Forbidden" }, 403);

      const rows = await sql`
        select business_id, phone_number_id, waba_id, display_phone_number,
               verified_name, quality_rating, status, last_verified_at,
               connected_at
        from private.whatsapp_connections
        where business_id = ${businessId}
        limit 1
      `;

      return json({
        connected: Boolean(rows[0]),
        connection: rows[0] ?? null,
      });
    }

    if (action === "disconnect") {
      const businessId = String(body?.businessId ?? "");
      if (!businessId) return json({ error: "businessId is required" }, 400);

      if (!(await assertOwner(businessId, user.id))) {
        return json({ error: "Only the business owner can disconnect WhatsApp" }, 403);
      }

      await sql`delete from private.whatsapp_connections where business_id = ${businessId}`;

      const { error } = await supabase
        .from("businesses")
        .update({
          whatsapp_phone_number_id: null,
          whatsapp_waba_id: null,
          whatsapp_connected_at: null,
          whatsapp_business_name: null,
        })
        .eq("id", businessId);

      if (error) throw error;
      return json({ success: true, connected: false });
    }

    // SET-004: server-side exchange of the Embedded Signup authorization code.
    if (action === "exchange_code") {
      const businessId = String(body?.businessId ?? "");
      const code = String(body?.code ?? "").trim();
      const wabaId = String(body?.wabaId ?? "").trim();
      const phoneNumberId = String(body?.phoneNumberId ?? "").trim();

      if (!businessId || !code || !wabaId || !phoneNumberId) {
        return json({ error: "businessId, code, wabaId and phoneNumberId are required" }, 400);
      }

      if (!/^\d+$/.test(phoneNumberId) || !/^\d+$/.test(wabaId)) {
        return json({ error: "Phone Number ID and WABA ID must be numeric Meta IDs" }, 400);
      }

      if (!(await assertOwner(businessId, user.id))) {
        return json({ error: "Only the business owner can connect WhatsApp" }, 403);
      }

      const exchange = await exchangeCodeForToken(code);
      if ("error" in exchange) {
        return json({ error: exchange.error, details: exchange.details ?? null }, 400);
      }

      const result = await finalizeConnection({
        businessId,
        phoneNumberId,
        wabaId,
        accessToken: exchange.accessToken,
      });

      if (!result.ok) {
        return json({ error: result.error, details: result.details ?? null }, 400);
      }

      return json({ success: true, connected: true, connection: result.connection });
    }

    // Legacy path: browser-supplied token. Retained for backward compatibility;
    // the SET-004 flow above is the production path.
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

      if (!(await assertOwner(businessId, user.id))) {
        return json({ error: "Only the business owner can connect WhatsApp" }, 403);
      }

      const result = await finalizeConnection({ businessId, phoneNumberId, wabaId, accessToken });
      if (!result.ok) {
        return json({ error: result.error, details: result.details ?? null }, 400);
      }

      return json({ success: true, connected: true, connection: result.connection });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error("whatsapp-connection error:", error);
    return json({ error: "Internal server error" }, 500);
  } finally {
    await closeSql().catch(() => undefined);
  }
});
