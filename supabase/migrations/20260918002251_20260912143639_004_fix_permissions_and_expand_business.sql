REVOKE EXECUTE ON FUNCTION is_business_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION is_business_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_owner(uuid) TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'owner_name') THEN
    ALTER TABLE businesses ADD COLUMN owner_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'phone') THEN
    ALTER TABLE businesses ADD COLUMN phone text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE businesses ADD COLUMN whatsapp_number text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'country') THEN
    ALTER TABLE businesses ADD COLUMN country text DEFAULT 'Nigeria';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'currency') THEN
    ALTER TABLE businesses ADD COLUMN currency text DEFAULT 'NGN';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'categories') THEN
    ALTER TABLE businesses ADD COLUMN categories text[] DEFAULT '{}'::text[];
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'setup_complete') THEN
    ALTER TABLE businesses ADD COLUMN setup_complete boolean DEFAULT false;
  END IF;
END $$;