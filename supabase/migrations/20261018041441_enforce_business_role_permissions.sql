/*
ABOS S0.3 — Enforce business membership roles at the database boundary.

Viewers retain read access allowed by existing SELECT policies but cannot
mutate business data. Agents can perform operational writes. Admins can
perform operational writes and manage configuration. Existing owner-only
delete/configuration policies remain owner-only where already defined.
*/

CREATE OR REPLACE FUNCTION private.has_business_role(
  check_business_id uuid,
  allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    (
      'owner' = ANY(COALESCE(allowed_roles, ARRAY[]::text[]))
      AND EXISTS (
        SELECT 1
        FROM public.businesses b
        WHERE b.id = check_business_id
          AND b.owner_id = (SELECT auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.business_memberships bm
      WHERE bm.business_id = check_business_id
        AND bm.user_id = (SELECT auth.uid())
        AND bm.role = ANY(COALESCE(allowed_roles, ARRAY[]::text[]))
    );
$function$;

REVOKE ALL ON FUNCTION private.has_business_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_business_role(uuid, text[]) TO authenticated;

CREATE OR REPLACE FUNCTION private.has_order_business_role(
  check_order_id uuid,
  allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    (
      'owner' = ANY(COALESCE(allowed_roles, ARRAY[]::text[]))
      AND EXISTS (
        SELECT 1
        FROM public.orders o
        JOIN public.businesses b ON b.id = o.business_id
        WHERE o.id = check_order_id
          AND b.owner_id = (SELECT auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      JOIN public.business_memberships bm ON bm.business_id = o.business_id
      WHERE o.id = check_order_id
        AND bm.user_id = (SELECT auth.uid())
        AND bm.role = ANY(COALESCE(allowed_roles, ARRAY[]::text[]))
    );
$function$;

REVOKE ALL ON FUNCTION private.has_order_business_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_order_business_role(uuid, text[]) TO authenticated;

-- Convert every member-wide write policy to a role-aware write policy.
-- Admin-only configuration tables receive the stricter owner/admin role set.
DO $policy_migration$
DECLARE
  pol record;
  v_qual text;
  v_check text;
  v_roles text;
  v_allowed_roles text;
  v_using_clause text;
  v_check_clause text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      AND (
        COALESCE(qual, '') LIKE '%private.is_business_member(%'
        OR COALESCE(with_check, '') LIKE '%private.is_business_member(%'
      )
  LOOP
    IF pol.tablename IN (
      'integrations',
      'automations',
      'business_knowledge',
      'conversation_ai_state'
    ) THEN
      v_allowed_roles := 'ARRAY[''owner'',''admin'']::text[]';
    ELSE
      v_allowed_roles := 'ARRAY[''owner'',''admin'',''agent'']::text[]';
    END IF;

    v_qual := pol.qual;
    v_check := pol.with_check;

    IF v_qual IS NOT NULL THEN
      v_qual := regexp_replace(
        v_qual,
        'private[.]is_business_member[(]([^)]*)[)]',
        'private.has_business_role(\1, ' || v_allowed_roles || ')',
        'g'
      );
    END IF;

    IF v_check IS NOT NULL THEN
      v_check := regexp_replace(
        v_check,
        'private[.]is_business_member[(]([^)]*)[)]',
        'private.has_business_role(\1, ' || v_allowed_roles || ')',
        'g'
      );
    END IF;

    v_roles := array_to_string(pol.roles, ', ');
    IF pol.roles @> ARRAY['public']::name[] THEN
      v_roles := 'authenticated';
    END IF;

    v_using_clause := CASE
      WHEN v_qual IS NULL THEN ''
      ELSE format(' USING (%s)', v_qual)
    END;

    v_check_clause := CASE
      WHEN v_check IS NULL THEN ''
      ELSE format(' WITH CHECK (%s)', v_check)
    END;

    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename
    );

    EXECUTE format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s',
      pol.policyname,
      pol.schemaname,
      pol.tablename,
      pol.permissive,
      pol.cmd,
      v_roles,
      v_using_clause,
      v_check_clause
    );
  END LOOP;
END;
$policy_migration$;

-- order_items policies use order_id to derive the business.
DROP POLICY IF EXISTS insert_order_items ON public.order_items;
CREATE POLICY insert_order_items
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  private.has_order_business_role(order_id, ARRAY['owner','admin','agent']::text[])
);

DROP POLICY IF EXISTS update_order_items ON public.order_items;
CREATE POLICY update_order_items
ON public.order_items FOR UPDATE TO authenticated
USING (
  private.has_order_business_role(order_id, ARRAY['owner','admin','agent']::text[])
)
WITH CHECK (
  private.has_order_business_role(order_id, ARRAY['owner','admin','agent']::text[])
);

DROP POLICY IF EXISTS delete_order_items ON public.order_items;
CREATE POLICY delete_order_items
ON public.order_items FOR DELETE TO authenticated
USING (
  private.has_order_business_role(order_id, ARRAY['owner','admin','agent']::text[])
);

-- SECURITY DEFINER RPCs must enforce role authorization internally because
-- they execute with the function owner's database privileges.
DO $rpc_migration$
DECLARE
  v_definition text;
  v_old text;
  v_new text;
BEGIN
  v_old := 'IF NOT private.is_business_member(v_product.business_id) THEN';
  v_new := 'IF NOT private.has_business_role(v_product.business_id, ARRAY[''owner'',''admin'',''agent'']::text[]) THEN';
  v_definition := pg_get_functiondef('public.adjust_product_stock(uuid,integer,text,text,text,uuid)'::regprocedure);
  IF position(v_old IN v_definition) = 0 THEN RAISE EXCEPTION 'Expected authorization check not found in adjust_product_stock'; END IF;
  EXECUTE replace(v_definition, v_old, v_new);

  v_old := 'IF NOT private.is_business_member(v_order.business_id) THEN';
  v_new := 'IF NOT private.has_business_role(v_order.business_id, ARRAY[''owner'',''admin'',''agent'']::text[]) THEN';
  v_definition := pg_get_functiondef('public.cancel_order(uuid)'::regprocedure);
  IF position(v_old IN v_definition) = 0 THEN RAISE EXCEPTION 'Expected authorization check not found in cancel_order'; END IF;
  EXECUTE replace(v_definition, v_old, v_new);

  v_definition := pg_get_functiondef('public.complete_order(uuid)'::regprocedure);
  IF position(v_old IN v_definition) = 0 THEN RAISE EXCEPTION 'Expected authorization check not found in complete_order'; END IF;
  EXECUTE replace(v_definition, v_old, v_new);

  v_old := 'IF NOT private.is_business_member(v_lead.business_id) THEN';
  v_new := 'IF NOT private.has_business_role(v_lead.business_id, ARRAY[''owner'',''admin'',''agent'']::text[]) THEN';
  v_definition := pg_get_functiondef('public.convert_lead_to_customer(uuid)'::regprocedure);
  IF position(v_old IN v_definition) = 0 THEN RAISE EXCEPTION 'Expected authorization check not found in convert_lead_to_customer'; END IF;
  EXECUTE replace(v_definition, v_old, v_new);

  v_old := 'IF NOT private.is_business_member(p_business_id) THEN';
  v_new := 'IF NOT private.has_business_role(p_business_id, ARRAY[''owner'',''admin'',''agent'']::text[]) THEN';
  v_definition := pg_get_functiondef('public.create_order_atomic(uuid,uuid,text,jsonb)'::regprocedure);
  IF position(v_old IN v_definition) = 0 THEN RAISE EXCEPTION 'Expected authorization check not found in create_order_atomic'; END IF;
  EXECUTE replace(v_definition, v_old, v_new);
END;
$rpc_migration$;

-- These are invoked by triggers, not intended as client-callable RPCs.
REVOKE ALL ON FUNCTION public.link_conversation_customer() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_initial_product_stock() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_order_status_transition() FROM PUBLIC, anon, authenticated;

-- The app's team-add flow now resolves email server-side; close the older
-- authenticated email-to-user-ID lookup to avoid account enumeration.
REVOKE ALL ON FUNCTION private.get_user_id_by_email(text) FROM PUBLIC, anon, authenticated;

-- Fix mutable search-path advisories on simple routines with no app-schema dependencies.
ALTER FUNCTION public.normalize_phone_digits(text) SET search_path = '';
ALTER FUNCTION public.enforce_order_status_transition() SET search_path = '';
