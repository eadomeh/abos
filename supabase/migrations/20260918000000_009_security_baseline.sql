/*
ABOS Security Baseline

- Remove the self-add path from business_memberships.
- Ensure a membership can only be inserted by the business owner.
- Prevent a non-owner from changing/deleting another member through direct REST calls.
- Add a unique business webhook routing constraint.
*/

DROP POLICY IF EXISTS "insert_memberships" ON business_memberships;
CREATE POLICY "insert_memberships"
ON business_memberships FOR INSERT
TO authenticated
WITH CHECK (
  is_business_owner(business_id)
);

DROP POLICY IF EXISTS "update_memberships" ON business_memberships;
CREATE POLICY "update_memberships"
ON business_memberships FOR UPDATE
TO authenticated
USING (
  is_business_owner(business_id)
)
WITH CHECK (
  is_business_owner(business_id)
);

DROP POLICY IF EXISTS "delete_memberships" ON business_memberships;
CREATE POLICY "delete_memberships"
ON business_memberships FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR is_business_owner(business_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_businesses_whatsapp_phone_number_id
  ON businesses(whatsapp_phone_number_id)
  WHERE whatsapp_phone_number_id IS NOT NULL;
