# ABOS-OPS-002 — Recover Live Supabase Edge Function Source

**Status:** LOCAL RECOVERY APPLIED — REVIEW AND VALIDATION REQUIRED

## Goal

Restore the active deployed Supabase Edge Function source and verified JWT settings to the canonical ABOS repository branch without changing production.

## Current state / evidence

- Branch: `mission-00/supabase-source-recovery`.
- Supabase project: `iqbhzoanssmskohhmpgj` (`ABOS-RICH`).
- Snapshot: private local export containing seven functions and their live version metadata.
- Live versions at export: `abos-ai-agent` v28; `abos-ai-eval` v9; `abos-ai-probe` v4; `whatsapp-connection` v8; `whatsapp-webhook` v9; `whatsapp-send` v7; `whatsapp-connect-once` v4.
- Prior read-only audit identified the production WhatsApp auto-reply path in the live webhook but not in GitHub `main`.
- A conservative literal-secret scan is run before copying; this is not a complete security audit.

## Scope

- Canonical `supabase/functions/<slug>/index.ts` and applicable `deno.json` files for the seven live functions.
- `supabase/config.toml` entries matching the verified live `verify_jwt` values.
- This task packet and its local evidence summary.

## Non-goals

- No production deploy, database/schema change, secret rotation, Vercel deploy, commit, or push.
- Do not change or stage `.abos/tasks/SET-001-whatsapp-connection-audit.md`.
- Do not commit the private snapshot, manifest metadata, credentials, or backups.

## Requirements

- Back up existing `supabase/` and `.abos/tasks/` outside the repo before copying.
- Preserve the deployed WhatsApp auto-reply and its fallback/owner-task path.
- Keep each function's `verify_jwt` setting aligned with the live deployment.
- Leave changes unstaged for review.

## Acceptance criteria

- [ ] Seven active Edge Function entrypoints are represented in the canonical repository.
- [ ] `supabase/config.toml` records the seven verified JWT settings.
- [ ] Source diff and secret scan reviewed; no raw credentials committed.
- [ ] App validation commands recorded; Edge Function runtime checks tracked separately.
- [ ] Git diff reviewed before commit; production stays unchanged.

## Validation commands

```bash
bash scripts/abos-ops-001-check.sh
npm run typecheck
npm run lint
npm run build
```

These checks do not replace remote runtime tests for Edge Functions.

## Rollback

Restore `supabase/` and `.abos/tasks/` from the private backup directory printed by the recovery script. No production rollback is required because production is not modified.
