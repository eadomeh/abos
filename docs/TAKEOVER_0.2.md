# Takeover 0.2

The Bolt-derived foundation has been migrated into the ABOS-owned Supabase project `ABOS-RICH` (`iqbhzoanssmskohhmpgj`).

Completed:
- Applied migrations 001 through 009 to the new database.
- Moved internal SECURITY DEFINER helpers into the private schema.
- Removed public-schema RPC exposure for those helpers.
- Optimized core RLS policies for auth init-plan behavior.
- Added missing conversation customer foreign-key index.
- Added channel abstraction for conversations/messages.
- Added uniqueness guards for WhatsApp conversation/message identities.
- Updated the WhatsApp sender integration to the current Meta Graph API v26.0.
- Kept browser configuration free of server secrets.

Not yet production complete:
- WhatsApp provider credentials are not configured.
- Multi-business per-tenant WhatsApp access-token storage/rotation needs to be implemented.
- Invitation flow should be replaced by a tokenized invitation model rather than email-to-auth lookup.
- Full automated tests and deployment pipeline are still to be added.
