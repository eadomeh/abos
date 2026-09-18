# ABOS Takeover Report — Foundation 0.1

## Baseline reviewed

The Bolt export supplied for ABOS Days 1–5 was inspected as a source snapshot. The project contains a React/Vite frontend, Supabase database migrations, Auth, Realtime conversation storage, and WhatsApp Edge Functions.

## Takeover changes completed

- Removed `.bolt/` metadata and stale Vite timestamp artifacts.
- Removed Bolt-branded Open Graph/Twitter asset references.
- Renamed the package from the Vite starter name to `abos-ai-business-os`.
- Added ABOS favicon/brand mark.
- Added `.env.example`; the exported `.env` is intentionally not part of the new source-of-truth snapshot.
- Changed Supabase Auth flow to PKCE.
- Removed logged-in email rendering from the workspace header/account menu.
- Wired the existing WhatsApp Settings tab into `SettingsPage`.
- Made the WhatsApp webhook endpoint verify Meta's `X-Hub-Signature-256` using `META_APP_SECRET`.
- Moved webhook verification to a server-side `WHATSAPP_WEBHOOK_VERIFY_TOKEN` contract.
- Changed webhook failures from unconditional HTTP 200 to HTTP 500 so failed processing can be retried.
- Reworked webhook claiming around the database's unique event key to make duplicate delivery handling idempotent.
- Removed the business-membership self-add authorization path.
- Added a uniqueness constraint for WhatsApp phone-number routing.
- Added architecture and development rules documentation.
- Added an offline foundation verification script.

## Important remaining architectural work

The current WhatsApp send function still uses one server-side `WHATSAPP_ACCESS_TOKEN`. That is acceptable only as a controlled development/platform connection. Before multi-business production onboarding, ABOS should move to per-business WhatsApp connections and use Meta's onboarding flow rather than making customers paste long-lived credentials into the client.

The next security milestone is role-aware authorization across every business table, followed by a proper invitation system that does not require exposing whether an email belongs to an account.
