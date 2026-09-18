/*
# Fix RLS Permission Error + Expand Business Profile

## Problem
Migration 003 revoked EXECUTE on `is_business_member` and `is_business_owner`
from `authenticated`. But RLS policy evaluation for a query running as
`authenticated` needs to call those functions — and without EXECUTE, the
policy fails with "permission denied for function is_business_member".

The Supabase advisor warned these functions are callable via REST RPC by
any signed-in user. The correct fix is NOT to revoke from authenticated
(which breaks RLS), but to revoke from `anon` only and keep `authenticated`.
The functions return boolean only and check ownership, so even if called
directly via RPC they leak nothing — they just confirm/deny the caller's
own membership. The advisor warning is a hardening note, not a real
vulnerability in this case.

## Changes

### 1. Re-grant EXECUTE to authenticated on helper functions
- `is_business_member(uuid)` — grant EXECUTE to authenticated
- `is_business_owner(uuid)` — grant EXECUTE to authenticated
- Keep revoked from anon and public

### 2. Expand businesses table with workspace setup fields
New columns (all nullable or have safe defaults, no data loss):
- `owner_name` (text) — display name of the business owner
- `phone` (text) — primary phone number
- `whatsapp_number` (text, nullable) — optional WhatsApp number
- `country` (text, default 'Nigeria') — country/location
- `currency` (text, default 'NGN') — currency code for orders/payments
- `categories` (text[], default '{}') — array of business category tags
- `setup_complete` (boolean, default false) — whether workspace setup was finished

### 3. Keep existing `category` column for backward compat
The old single `category` column stays; new `categories` array is the
primary going forward. No data loss.

## Security
- RLS policies unchanged (they already use the helper functions correctly).
- Helper functions remain SECURITY DEFINER with search_path = public.
- anon role still cannot call the functions.
- authenticated role can call them (needed for RLS policy evaluation).
*/

-- ============================================================
-- 1. Re-grant EXECUTE to authenticated (fixes permission denied)
-- ============================================================
REVOKE EXECUTE ON FUNCTION is_business_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION is_business_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_business_owner(uuid) TO authenticated;

-- ============================================================
-- 2. Expand businesses table
-- ============================================================

-- Add new columns with safe defaults (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'owner_name') THEN
    ALTER TABLE businesses ADD COLUMN owner_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'phone') THEN
    ALTER TABLE businesses ADD COLUMN phone text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE businesses ADD COLUMN whatsapp_number text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'country') THEN
    ALTER TABLE businesses ADD COLUMN country text DEFAULT 'Nigeria';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'currency') THEN
    ALTER TABLE businesses ADD COLUMN currency text DEFAULT 'NGN';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'categories') THEN
    ALTER TABLE businesses ADD COLUMN categories text[] DEFAULT '{}'::text[];
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'setup_complete') THEN
    ALTER TABLE businesses ADD COLUMN setup_complete boolean DEFAULT false;
  END IF;
END $$;