CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  logo_url text,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_businesses" ON businesses;
CREATE POLICY "select_businesses"
ON businesses FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM business_memberships
    WHERE business_memberships.business_id = businesses.id
    AND business_memberships.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_businesses" ON businesses;
CREATE POLICY "insert_businesses"
ON businesses FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "update_businesses" ON businesses;
CREATE POLICY "update_businesses"
ON businesses FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "delete_businesses" ON businesses;
CREATE POLICY "delete_businesses"
ON businesses FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "select_memberships" ON business_memberships;
CREATE POLICY "select_memberships"
ON business_memberships FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_memberships.business_id
    AND businesses.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_memberships" ON business_memberships;
CREATE POLICY "insert_memberships"
ON business_memberships FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_memberships.business_id
    AND businesses.owner_id = auth.uid()
  )
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "update_memberships" ON business_memberships;
CREATE POLICY "update_memberships"
ON business_memberships FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_memberships.business_id
    AND businesses.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_memberships.business_id
    AND businesses.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_memberships" ON business_memberships;
CREATE POLICY "delete_memberships"
ON business_memberships FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_memberships.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();