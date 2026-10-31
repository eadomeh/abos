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

DROP POLICY IF EXISTS "select_businesses" ON businesses;
CREATE POLICY "select_businesses"
ON businesses FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR is_business_member(id));

DROP POLICY IF EXISTS "select_memberships" ON business_memberships;
CREATE POLICY "select_memberships"
ON business_memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_business_owner(business_id));

DROP POLICY IF EXISTS "insert_memberships" ON business_memberships;
CREATE POLICY "insert_memberships"
ON business_memberships FOR INSERT
TO authenticated
WITH CHECK (is_business_owner(business_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "update_memberships" ON business_memberships;
CREATE POLICY "update_memberships"
ON business_memberships FOR UPDATE
TO authenticated
USING (is_business_owner(business_id))
WITH CHECK (is_business_owner(business_id));

DROP POLICY IF EXISTS "delete_memberships" ON business_memberships;
CREATE POLICY "delete_memberships" ON business_memberships FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR is_business_owner(business_id));