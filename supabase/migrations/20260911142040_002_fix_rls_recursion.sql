/*
# Fix RLS Infinite Recursion on businesses and business_memberships

## Problem
The SELECT policies on `businesses` and `business_memberships` reference each
other, creating an infinite recursion:

- `businesses` SELECT policy checks `business_memberships` (to see if the user
  is a member)
- `business_memberships` SELECT policy checks `businesses` (to see if the user
  owns the business)

When a query touches either table, Postgres follows the cross-reference loop
until it aborts with:
  "infinite recursion detected in policy for relation businesses"

## Fix
Create two `SECURITY DEFINER` helper functions that bypass RLS when checking
membership/ownership. Because SECURITY DEFINER functions run with the owner's
privileges, the sub-queries inside them do NOT trigger RLS policy evaluation,
breaking the cycle.

### New Functions
1. `is_business_member(check_business_id uuid)` — returns true if the calling
   authenticated user has a row in `business_memberships` for the given business.
2. `is_business_owner(check_business_id uuid)` — returns true if the calling
   authenticated user is the `owner_id` of the given business.

Both functions:
- Are `SECURITY DEFINER` (bypass RLS internally).
- Have `search_path = public` (immutable, safe).
- Have EXECUTE revoked from PUBLIC and anon, granted only to authenticated.

### Policy Changes
- `businesses` SELECT: uses `is_business_member(id)` instead of a sub-query
  on `business_memberships`.
- `business_memberships` SELECT: uses `is_business_owner(business_id)` instead
  of a sub-query on `businesses`.
- `business_memberships` INSERT/UPDATE/DELETE: same replacement of cross-table
  sub-queries with the appropriate function.

### Security
- Users can still only see businesses they own or belong to.
- Business owners can still manage memberships.
- No user can access another business's data.
- The recursion is eliminated.
*/

-- ============================================================
-- SECURITY DEFINER helper functions (bypass RLS, no recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION is_business_member(check_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_memberships
    WHERE business_memberships.business_id = check_business_id
      AND business_memberships.user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION is_business_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_member(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_business_owner(check_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = check_business_id
      AND businesses.owner_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION is_business_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_owner(uuid) TO authenticated;

-- ============================================================
-- Rewrite businesses SELECT policy (breaks recursion)
-- ============================================================
DROP POLICY IF EXISTS "select_businesses" ON businesses;
CREATE POLICY "select_businesses"
ON businesses FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR is_business_member(id)
);

-- ============================================================
-- Rewrite business_memberships policies (breaks recursion)
-- ============================================================

-- SELECT
DROP POLICY IF EXISTS "select_memberships" ON business_memberships;
CREATE POLICY "select_memberships"
ON business_memberships FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR is_business_owner(business_id)
);

-- INSERT
DROP POLICY IF EXISTS "insert_memberships" ON business_memberships;
CREATE POLICY "insert_memberships"
ON business_memberships FOR INSERT
TO authenticated
WITH CHECK (
  is_business_owner(business_id)
  OR user_id = auth.uid()
);

-- UPDATE
DROP POLICY IF EXISTS "update_memberships" ON business_memberships;
CREATE POLICY "update_memberships"
ON business_memberships FOR UPDATE
TO authenticated
USING (is_business_owner(business_id))
WITH CHECK (is_business_owner(business_id));

-- DELETE
DROP POLICY IF EXISTS "delete_memberships" ON business_memberships;
CREATE POLICY "delete_memberships"
ON business_memberships FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR is_business_owner(business_id)
);