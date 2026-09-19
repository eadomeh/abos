CREATE SCHEMA IF NOT EXISTS private;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS private.whatsapp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text NOT NULL,
  encrypted_access_token text NOT NULL,
  display_phone_number text,
  verified_name text,
  quality_rating text,
  status text NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'error', 'disconnected')),
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.whatsapp_connections TO service_role;

CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_business_id
  ON private.whatsapp_connections(business_id);

CREATE OR REPLACE FUNCTION private.touch_whatsapp_connection()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.touch_whatsapp_connection() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trigger_touch_whatsapp_connection ON private.whatsapp_connections;
CREATE TRIGGER trigger_touch_whatsapp_connection
BEFORE UPDATE ON private.whatsapp_connections
FOR EACH ROW
EXECUTE FUNCTION private.touch_whatsapp_connection();
