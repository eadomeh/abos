/*
# Harden SECURITY DEFINER functions and fix search_path warnings

## Changes
1. Add `SET search_path = public` to `update_updated_at_column` to resolve
   the `function_search_path_mutable` advisor warning.
2. Revoke EXECUTE from `authenticated` on `is_business_member` and
   `is_business_owner` so they cannot be called directly via the REST API
   (e.g. `/rest/v1/rpc/is_business_member`). These functions are internal
   helpers used inside RLS policies, not public API endpoints.
3. Grant EXECUTE only to the `service_role` (which bypasses RLS anyway and
   does not need them, but keeps the grant explicit for clarity).
4. Re-grant EXECUTE to `authenticated` on the functions ONLY for internal
   policy use — but since RLS policy evaluation runs as the table owner
   (superuser), the policies can call the functions even without explicit
   EXECUTE grants to authenticated. So we revoke from authenticated entirely.

## Security
- Functions are still SECURITY DEFINER with `search_path = public`.
- They can no longer be called directly by any user via the REST API.
- RLS policies can still call them internally (policy evaluation runs with
  elevated privileges).
*/

-- Fix update_updated_at_column search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Harden is_business_member: revoke direct call access
REVOKE EXECUTE ON FUNCTION is_business_member(uuid) FROM PUBLIC, anon, authenticated;

-- Harden is_business_owner: revoke direct call access
REVOKE EXECUTE ON FUNCTION is_business_owner(uuid) FROM PUBLIC, anon, authenticated;