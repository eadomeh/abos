/*
# Day 5: WhatsApp Business Cloud API Integration Schema

This migration adds the database structures needed to connect ABOS to
the WhatsApp Business Cloud API. It enables:
- Receiving incoming WhatsApp messages via webhook
- Sending outgoing replies through Meta's API
- Tracking message delivery status (sent, delivered, read, failed)
- Deduplicating webhook deliveries (Meta retries on timeout)
- Storing WhatsApp connection settings per business

## 1. Modified Tables

### `businesses` — new columns
- `whatsapp_phone_number_id` (text, nullable) — Meta's phone number ID for sending
- `whatsapp_waba_id` (text, nullable) — WhatsApp Business Account ID
- `whatsapp_verify_token` (text, nullable) — token for webhook verification
- `whatsapp_connected_at` (timestamptz, nullable) — when connection was established
- `whatsapp_business_name` (text, nullable) — display name from WhatsApp profile

### `messages` — new columns
- `wa_message_id` (text, nullable) — Meta's message ID for tracking delivery
- `status` (text, default 'sent') — delivery status: sent, delivered, read, failed
- `error_code` (text, nullable) — Meta error code if sending failed
- `error_message` (text, nullable) — human-readable error description

## 2. New Tables

### `whatsapp_webhook_events`
Stores raw webhook events for deduplication and audit.
- id (uuid, primary key)
- business_id (uuid, FK to businesses, cascade delete)
- wa_event_id (text, unique) — Meta's event ID for dedup
- event_type (text) — message, status, etc.
- payload (jsonb) — full webhook payload
- processed (boolean, default false)
- created_at (timestamptz)

## 3. Security
- RLS enabled on whatsapp_webhook_events
- Business members can SELECT; only owners can DELETE
- INSERT is NOT granted to authenticated — only the service role (edge function) inserts
- UPDATE is NOT granted to authenticated — edge function updates via service role

## 4. Indexes
- whatsapp_webhook_events: business_id, wa_event_id (unique)
- messages: wa_message_id for status updates
- businesses: whatsapp_phone_number_id for webhook routing

## 5. Important Notes
1. The edge function uses the Supabase service role key to insert messages,
   bypassing RLS. This is necessary because webhooks arrive without a user
   session — there is no authenticated user. The service role has full access.
2. The `whatsapp_verify_token` is a shared secret between Meta and ABOS.
   When connecting, the business owner sets this token in ABOS, then enters
   the same token in Meta's webhook configuration. The edge function verifies
   it on every webhook request.
3. Message deduplication: Meta retries webhook delivery if it doesn't get a
   200 response within 5 seconds. We store each event's ID and skip duplicates.
4. The `status` column on messages tracks the lifecycle:
   - 'sent' — message accepted by Meta (default for outgoing)
   - 'delivered' — Meta confirmed delivery to the recipient
   - 'read' — recipient opened the message
   - 'failed' — Meta rejected the message
*/

-- Add WhatsApp columns to businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_waba_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_token text,
  ADD COLUMN IF NOT EXISTS whatsapp_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_business_name text;

-- Add delivery tracking columns to messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS wa_message_id text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS error_message text;

-- Index for looking up messages by WhatsApp message ID (for status updates)
CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON messages(wa_message_id) WHERE wa_message_id IS NOT NULL;

-- Index for routing webhooks to the correct business
CREATE INDEX IF NOT EXISTS idx_businesses_wa_phone_number_id ON businesses(whatsapp_phone_number_id) WHERE whatsapp_phone_number_id IS NOT NULL;

-- Webhook events table for deduplication and audit
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

-- Only owners can view webhook events; inserts are service-role only (edge function)
DROP POLICY IF EXISTS "select_wa_webhook_events" ON whatsapp_webhook_events;
CREATE POLICY "select_wa_webhook_events" ON whatsapp_webhook_events FOR SELECT
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "delete_wa_webhook_events" ON whatsapp_webhook_events;
CREATE POLICY "delete_wa_webhook_events" ON whatsapp_webhook_events FOR DELETE
  TO authenticated USING (is_business_owner(business_id));