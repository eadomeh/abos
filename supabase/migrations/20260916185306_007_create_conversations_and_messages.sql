/*
# Day 4: Conversations and Messages

1. New Tables
- `conversations` — represents a chat thread between a business and a customer
  - id (uuid, primary key)
  - business_id (uuid, FK to businesses, cascade delete)
  - customer_id (uuid, FK to customers, nullable, set null on delete)
  - customer_name (text, not null — denormalized for quick display)
  - customer_phone (text, nullable)
  - last_message_preview (text, nullable — updated on new message)
  - last_message_at (timestamptz, nullable — used for sorting)
  - unread_count (integer, default 0 — incoming messages not yet read)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- `messages` — individual messages within a conversation
  - id (uuid, primary key)
  - conversation_id (uuid, FK to conversations, cascade delete)
  - business_id (uuid, FK to businesses, cascade delete — for direct RLS checks)
  - direction (text, 'incoming' or 'outgoing')
  - content (text, not null)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Conversations: business members can SELECT/INSERT/UPDATE; only owners can DELETE.
- Messages: business members can SELECT/INSERT; updates and deletes restricted to owners.
- Uses existing is_business_member() and is_business_owner() helper functions.

3. Indexes
- conversations: business_id, last_message_at DESC
- messages: conversation_id, created_at, business_id

4. Helper Function
- is_conversation_business_member(check_conversation_id uuid) — checks membership
  through the conversation's business_id for message-level RLS.

5. Notes
- Real-time subscriptions will use these tables via Supabase realtime.
- WhatsApp webhook integration (Day 5) will insert incoming messages here.
- For now, users can start conversations manually and send messages in-app.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  last_message_preview text,
  last_message_at timestamptz,
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

DROP POLICY IF EXISTS "select_conversations" ON conversations;
CREATE POLICY "select_conversations" ON conversations FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_conversations" ON conversations;
CREATE POLICY "insert_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_conversations" ON conversations;
CREATE POLICY "update_conversations" ON conversations FOR UPDATE
  TO authenticated USING (is_business_member(business_id))
  WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_conversations" ON conversations;
CREATE POLICY "delete_conversations" ON conversations FOR DELETE
  TO authenticated USING (is_business_owner(business_id));

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'outgoing' CHECK (direction IN ('incoming', 'outgoing')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_business_id ON messages(business_id);

CREATE OR REPLACE FUNCTION is_conversation_business_member(check_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = check_conversation_id
    AND is_business_member(conversations.business_id)
  );
$$;

REVOKE EXECUTE ON FUNCTION is_conversation_business_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_conversation_business_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "select_messages" ON messages;
CREATE POLICY "select_messages" ON messages FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_messages" ON messages;
CREATE POLICY "update_messages" ON messages FOR UPDATE
  TO authenticated USING (is_business_owner(business_id))
  WITH CHECK (is_business_owner(business_id));
DROP POLICY IF EXISTS "delete_messages" ON messages;
CREATE POLICY "delete_messages" ON messages FOR DELETE
  TO authenticated USING (is_business_owner(business_id));

-- Trigger for updated_at on conversations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
    CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;