# ABOS-WA-002 — WhatsApp Embedded Signup Connect Fix

**Status:** IN PROGRESS  
**Branch:** `fix/wa-002-embedded-signup-launch`  
**Owner (code):** Grok  
**Owner (secrets / Meta / Edge deploy):** ChatGPT + human operator

## Goal

Make **Connect WhatsApp** complete Meta Embedded Signup v4 so owners can attach a WhatsApp Business number to a business workspace.

## Current state / evidence

- Live UI error on Settings → WhatsApp:
  `Meta did not return an authorization code. Status: unknown (response keys: authResponse, status).`
- That string is produced only when `FB.login` returns **without** `authResponse.code`.
- Env vars for App ID / Config ID are present in production (otherwise the UI would show the “not configured” messages).
- Server path `whatsapp-connection` action `exchange_code` is implemented and does not return tokens to the browser.
- `whatsapp-connect-once` is intentionally retired (HTTP 410).
- Mobile / in-app browsers commonly block the Meta popup → status `unknown`.

## Scope

- `src/components/pages/SettingsPage.tsx` (Embedded Signup launch + diagnostics only)
- This task packet and its evidence file

## Non-goals

- No database migration
- No change to token encryption, private schema, or webhook processing
- No AI agent / media work
- No Automations
- No Vercel connector requirement

## Requirements

1. Pass Meta-recommended Embedded Signup `extras` (`setup`, `featureType`, `sessionInfoVersion: '3'`).
2. Initialize FB SDK with `xfbml: false`.
3. Clearer owner-facing errors for `unknown` and `not_authorized`.
4. Do not log or surface access tokens.
5. Keep server-side code exchange as the only path that receives Meta secrets.

## Acceptance criteria

- [ ] Typecheck / lint clean for touched files
- [ ] On Chrome mobile or desktop with popups allowed, Connect WhatsApp either:
  - completes to connected state, **or**
  - shows a precise, actionable error (not a vague unknown)
- [ ] When Meta returns a code + session FINISH asset IDs, `exchange_code` still runs server-side
- [ ] No secrets committed

## Operator checklist (human + ChatGPT — do not paste secrets in chat)

1. Vercel env: `VITE_META_APP_ID`, `VITE_META_EMBEDDED_SIGNUP_CONFIG_ID` present and redeployed.
2. Supabase Edge secrets: `META_APP_ID`, `META_APP_SECRET` present on `whatsapp-connection`.
3. Meta Developer App: domain `abos-tau.vercel.app` allowed; Embedded Signup config ID matches Vercel.
4. Test in **Chrome**, not Grok in-app browser; allow popups.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

Live: Settings → WhatsApp → Connect WhatsApp on Chrome.

## Rollback

Revert the branch commit / PR. No schema change.
