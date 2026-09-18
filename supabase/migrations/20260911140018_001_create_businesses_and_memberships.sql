/*
# ABOS Day 1: Create businesses and business_memberships tables

## What this migration does
This is the foundational schema for the African Business Operating System (ABOS).
It creates the core tables that allow a user to own multiple businesses,
belong to multiple businesses with different roles, and switch between them.

## New Tables

### 1. businesses
Stores business profiles. Each business belongs to one owner but can have
multiple members with different roles.
- `id` (uuid, primary key) - unique business identifier
- `name` (text, not null) - business name
- `description` (text) - what the business does
- `category` (text) - business type (retail, food, services, etc.)
- `logo_url` (text) - URL to business logo image
- `owner_id` (uuid, not null, defaults to auth.uid()) - the user who owns this business
- `created_at` (timestamptz) - when the business was created
- `updated_at` (timestamptz) - when the business was last updated

### 2. business_memberships
Links users to businesses with specific roles. A user can be a member of
multiple businesses, and each business can have multiple members.
- `id` (uuid, primary key) - unique membership identifier
- `business_id` (uuid, foreign key to businesses) - which business this membership is for
- `user_id` (uuid, not null, defaults to auth.uid()) - which user is the member
- `role` (text, not null, default 'viewer') - one of: owner, admin, agent, viewer
- `created_at` (timestamptz) - when the membership was created
- Unique constraint on (business_id, user_id) to prevent duplicate memberships

## Security (Row Level Security)

### businesses table
- SELECT: Users can see businesses they own OR are a member of
- INSERT: Users can create new businesses (owner_id must be their own ID)
- UPDATE: Only the business owner can update business details
- DELETE: Only the business owner can delete a business

### business_memberships table
- SELECT: Users can see their own memberships AND memberships of businesses they own
- INSERT: Only the business owner can add new members
- UPDATE: Only the business owner can change member roles
- DELETE: Users can remove themselves OR the business owner can remove members

## Important Notes
1. When a business is created, a corresponding 'owner' membership record
   should be inserted by the application code.
2. The owner_id column defaults to auth.uid() so that the insert succeeds
   even when the client omits it.
3. Foreign keys use ON DELETE CASCADE so that deleting a business also
   deletes all its memberships.
*/

-- Create businesses table
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

-- Create business_memberships table
CREATE TABLE IF NOT EXISTS business_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- businesses RLS policies
-- ============================================================

-- SELECT: Users can see businesses they own OR are a member of
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

-- INSERT: Users can create new businesses (owner_id must be their own)
DROP POLICY IF EXISTS "insert_businesses" ON businesses;
CREATE POLICY "insert_businesses"
ON businesses FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- UPDATE: Only the business owner can update
DROP POLICY IF EXISTS "update_businesses" ON businesses;
CREATE POLICY "update_businesses"
ON businesses FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- DELETE: Only the business owner can delete
DROP POLICY IF EXISTS "delete_businesses" ON businesses;
CREATE POLICY "delete_businesses"
ON businesses FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- ============================================================
-- business_memberships RLS policies
-- ============================================================

-- SELECT: Users can see their own memberships AND memberships of businesses they own
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

-- INSERT: Only the business owner can add members
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

-- UPDATE: Only the business owner can change roles
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

-- DELETE: Users can remove themselves OR the business owner can remove members
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

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);

-- ============================================================
-- updated_at trigger for businesses
-- ============================================================
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