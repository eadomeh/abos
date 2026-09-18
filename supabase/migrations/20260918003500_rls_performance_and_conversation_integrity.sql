CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);

CREATE OR REPLACE FUNCTION private.is_business_member(check_business_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_memberships
    WHERE business_memberships.business_id = check_business_id
      AND business_memberships.user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION private.is_business_owner(check_business_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = check_business_id
      AND businesses.owner_id = (SELECT auth.uid())
  );
$$;

DROP POLICY IF EXISTS "select_businesses" ON businesses;
CREATE POLICY "select_businesses" ON businesses FOR SELECT TO authenticated
USING (owner_id = (SELECT auth.uid()) OR private.is_business_member(id));

DROP POLICY IF EXISTS "insert_businesses" ON businesses;
CREATE POLICY "insert_businesses" ON businesses FOR INSERT TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "update_businesses" ON businesses;
CREATE POLICY "update_businesses" ON businesses FOR UPDATE TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "delete_businesses" ON businesses;
CREATE POLICY "delete_businesses" ON businesses FOR DELETE TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "select_memberships" ON business_memberships;
CREATE POLICY "select_memberships" ON business_memberships FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR private.is_business_owner(business_id));

DROP POLICY IF EXISTS "delete_memberships" ON business_memberships;
CREATE POLICY "delete_memberships" ON business_memberships FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()) OR private.is_business_owner(business_id));
