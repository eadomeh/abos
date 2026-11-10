# ABOS-S4-001 — Linked follow-up tasks

**Status:** IN PROGRESS

## Goal

Allow authorized business users to create follow-up tasks directly from a customer or lead and see the linked person in the Tasks queue.

## Branch

- Repository: `eadomeh/abos`
- Branch: `feature/slice-4-linked-follow-up-tasks`
- Baseline: `main` `1139d93dc9cf374166659db1e920047461f2de0e`
- Not based on the discovery branch.

## Scope

- `src/components/pages/TasksPage.tsx`
- `src/components/pages/LeadsPage.tsx`
- `src/components/pages/CustomersPage.tsx`
- `src/components/tasks/CreateFollowUpTaskDialog.tsx`
- One additive migration under `supabase/migrations/`
- `.abos/evidence/S4-001-linked-follow-up-tasks.md`

`src/types/database.ts` already has `related_customer_id` and `related_lead_id`. Do not change it unless inspection proves otherwise.

## Rules

- Owner, admin, and agent may create follow-up tasks. Viewers stay read-only in the UI.
- Live `tasks_insert` and `tasks_update` already use `private.has_business_role` for owner, admin, and agent. Do not alter those policies.
- Same-business integrity for `related_customer_id` and `related_lead_id` is enforced by a new trigger, not by the client alone.
- Foreign keys stay ID-only with existing delete behavior.
- Preflight aborts the migration if any cross-business link already exists.
- Do not use SECURITY DEFINER for convenience.
- Do not apply the migration to production in this task.
- Do not create tasks when lead status changes.
- Do not add an automations runner, WhatsApp, auth, Edge Function, or AI/payment settings change.

## Non-goals

No production migration, no Vercel production promotion, no change to `main`.
