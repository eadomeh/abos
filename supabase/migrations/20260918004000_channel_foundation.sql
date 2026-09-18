ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email', 'web')),
  ADD COLUMN IF NOT EXISTS external_thread_id text;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email', 'web')),
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS ux_conversations_business_channel_customer_phone
  ON conversations(business_id, channel, customer_phone)
  WHERE customer_phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_messages_business_channel_external_id
  ON messages(business_id, channel, wa_message_id)
  WHERE wa_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_business_channel
  ON conversations(business_id, channel);

CREATE INDEX IF NOT EXISTS idx_messages_business_channel
  ON messages(business_id, channel);
