# ABOS-WA-001 — WhatsApp Connection Health Check

## Goal
Expose a real, owner-authorized health check for the saved WhatsApp Business connection so Settings does not equate a database row with a currently healthy Meta connection.

## Acceptance criteria
- Settings provides a `Check connection` action only when a WhatsApp connection is present.
- The authenticated Edge Function enforces business-owner authorization server-side.
- The check verifies the saved credential against Meta, confirms the phone belongs to the saved WABA, and checks whether ABOS's Meta App ID appears in the WABA's `subscribed_apps` response.
- The Edge Function decrypts credentials server-side only. No token, app secret, customer content, or private credential is returned to the browser or written to logs.
- The UI shows healthy, warning, or error; phone verification, webhook subscription status, and time of check.
- The last verification timestamp and available phone metadata refresh after successful phone/WABA verification. A webhook check that is false/unknown does not falsely report healthy.
- No message is sent and no automatic webhook resubscription occurs during this health check.
- No database migration, schema change, or permission relaxation.
- `.abos/tasks/SET-001-whatsapp-connection-audit.md` stays untouched and unstaged.

## Baseline evidence (read-only, 22 Oct 2026)
- `whatsapp-connection` Edge Function was ACTIVE at version 8 and already included secure code exchange and encrypted token persistence.
- One persisted connection was marked `connected`, with an encrypted token present.
- The database held 193 webhook events (193 processed), 54 inbound WhatsApp messages, 57 outbound WhatsApp messages, and two WhatsApp conversations. Latest recorded message activity was 19 Oct 2026.
- This proves prior activity, not current Meta credential validity or current WABA webhook subscription.

## Scope
`src/components/pages/SettingsPage.tsx`, `supabase/functions/whatsapp-connection/index.ts`, this task packet, and its evidence file. No migrations.

## Verification
Run typecheck, production build, targeted ESLint, TypeScript syntax parse for the Edge Function, and `git diff --check`. After source release, deploy the matching Edge Function source to Supabase and verify its active version. Real phone health-check and real inbound/outbound acceptance remain pending until the owner runs those actions.

## Rollback
Revert the code commit and redeploy the prior `whatsapp-connection` source version. No database schema/data migration is introduced.
