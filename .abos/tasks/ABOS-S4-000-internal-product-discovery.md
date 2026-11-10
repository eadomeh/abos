# ABOS-S4-000 — Internal product discovery

**Status:** DISCOVERY ONLY

## Goal

Establish the first evidence-based Slice 4 implementation target for ABOS's internal product experience.

## Status rules

- This packet authorizes inspection and this written record only.
- No application-code changes are authorized in this task.
- No production Supabase or Vercel operations are authorized.
- Do not start Slice 4 implementation until a later packet scopes it.

## Branch

- Repository: `eadomeh/abos`
- Branch: `feature/slice-4-internal-product-discovery`
- Baseline: `main` at `1139d93dc9cf374166659db1e920047461f2de0e`
- Verified immediately before branch creation. `main` had not moved.
- Not based on `feature/landing-page-redesign`.

## Evidence to inspect

- Dashboard, products and catalog, orders and payments, customers and leads, conversations, AI agent, tasks, analytics, automations, settings and business profile.
- Page components, navigation, business context, roles, data load/save/mutation paths, loading/empty/success/error/cancellation states, mobile behavior, business-scoped queries, authorization boundaries.
- Migrations, RLS source, and Edge Function integrations present in this tree.
- Existing `.abos/tasks/` packets and `.abos/evidence/` records.

Code and migration files on this branch are evidence of implementation, not proof of live production behavior.

## Specific verification

`ABOS-SET-001-business-ai-controls.md` is marked in progress. Verify what `main` already contains for `business_ai_settings`, the settings UI, and `abos-ai-agent` reply preferences. Do not treat the task as complete. Do not create a duplicate migration or settings feature.

## Deliverable

`.abos/evidence/S4-internal-product-discovery.md`

## Non-goals

- No application source edits.
- No secrets inspection, copy, or output.
- No production schema, environment, or deployment changes.
- No force-push.
