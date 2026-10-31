ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_waba_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_token text,
  ADD COLUMN IF NOT EXISTS whatsapp_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_business_name text;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS wa_message_id text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS error_message text;

CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON messages(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_wa_phone_number_id ON businesses(whatsapp_phone_number_id) WHERE whatsapp_phone_number_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  wa_event_id text UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_wa_webhook_events_business_id ON whatsapp_webhook_events(business_id);
CREATE INDEX IF NOT EXISTS idx_wa_webhook_events_created_at ON whatsapp_webhook_events(created_at DESC);

DROP POLICY IF EXISTS "select_wa_webhook_events" ON whatsapp_webhook_events;
CREATE POLICY "select_wa_webhook_events" ON whatsapp_webhook_events FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_wa_webhook_events" ON whatsapp_webhook_events;
CREATE POLICY "delete_wa_webhook_events" ON whatsapp_webhook_events FOR DELETE
  TO authenticated USING (is_business_owner(business_id));