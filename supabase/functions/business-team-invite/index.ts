import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DATABASE_URL = Deno.env.get("SUPABASE_DB_URL") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, X-Client-Info, Apikey, X-Supabase-Api-Version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
    return json({ error: "Team service is not configured." }, 500);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json({ error: "Please sign in and try again." }, 401);
  }

  const accessToken = authorization.slice(7);
  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  const user = authData.user;
  if (authError || !user) {
    return json({ error: "Your session is invalid. Please sign in again." }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const businessId =
    typeof body.businessId === "string" ? body.businessId.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role : "";

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(businessId)
  ) {
    return json({ error: "A valid business is required." }, 400);
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  if (!["admin", "agent", "viewer"].includes(role)) {
    return json({ error: "Choose a valid team role." }, 400);
  }

  // Service-role access bypasses RLS, so explicitly verify ownership here.
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, owner_id")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError) {
    return json({ error: "Could not verify business access. Try again." }, 500);
  }

  if (!business || business.owner_id !== user.id) {
    return json({ error: "Only the business owner can add team members." }, 403);
  }

  const db = postgres(DATABASE_URL, { max: 1 });

  try {
    const users = await db`
      select id
      from auth.users
      where lower(email) = ${email}
      limit 1
    `;

    const targetUserId = users[0]?.id as string | undefined;

    if (!targetUserId) {
      return json({
        error: "No ABOS account was found for that email. Ask the person to sign in to ABOS first.",
      }, 404);
    }

    if (targetUserId === user.id) {
      return json({ error: "You are already the owner of this business." }, 409);
    }

    const existing = await db`
      select id
      from public.business_memberships
      where business_id = ${businessId}::uuid
        and user_id = ${targetUserId}::uuid
      limit 1
    `;

    if (existing.length > 0) {
      return json({ error: "This person is already a team member." }, 409);
    }

    // Let PostgreSQL enforce any unique membership constraints to protect
    // against two concurrent requests adding the same person.
    const inserted = await db`
      insert into public.business_memberships (business_id, user_id, role)
      values (${businessId}::uuid, ${targetUserId}::uuid, ${role})
      on conflict do nothing
      returning id, role
    `;

    if (inserted.length === 0) {
      return json({ error: "This person is already a team member." }, 409);
    }

    return json({
      success: true,
      memberId: inserted[0].id,
      role: inserted[0].role,
      message: "Team member added successfully.",
    });
  } catch {
    console.error("business-team-invite: database operation failed");
    return json({ error: "Could not add this team member. Please try again." }, 500);
  } finally {
    await db.end({ timeout: 5 }).catch(() => undefined);
  }
});
