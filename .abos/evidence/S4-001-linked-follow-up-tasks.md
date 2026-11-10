# S4-001 — Linked follow-up tasks

**Branch:** `feature/slice-4-linked-follow-up-tasks`
**Baseline:** `1139d93dc9cf374166659db1e920047461f2de0e`
**Implementation commit:** `8bc1905ebcae24bd5ac8fcb5d68c352272175ffd`

## What shipped in source

- `src/components/tasks/CreateFollowUpTaskDialog.tsx` creates a task for the active business only. It re-reads the customer or lead with `business_id` before insert. A lead's `related_customer_id` is set only when that customer row is in the same business.
- Customer 360 has **Create follow-up** for owner, admin, and agent. Success calls a refresh of the open-task count query.
- Lead detail has **Create follow-up**. Status changes do not create tasks.
- Tasks loads `related_customer_id`, `related_lead_id`, and names through `customers!tasks_related_customer_id_fkey` and `leads!tasks_related_lead_id_fkey`.
- Generic **New task** remains, and is hidden for viewers. It still inserts without relationship columns.
- Cancel closes the dialog without an insert.
- `src/types/database.ts` was not changed.

## Migration (not applied)

`supabase/migrations/20261110110000_tasks_same_business_links.sql`

- Preflight raises if any existing customer or lead link has a different `business_id`.
- `BEFORE INSERT OR UPDATE` trigger `tasks_same_business_links` calls `public.tasks_enforce_same_business_links()`.
- Function is `LANGUAGE plpgsql` with `search_path = ''`. It is not `SECURITY DEFINER`.
- Execute is revoked from `public`, `anon`, and `authenticated`.
- Existing foreign keys and task RLS policies are untouched.
- Production was not migrated.

## Checks run on this machine

- `npm run typecheck`: pass.
- `npm run lint`: **26 errors, 1 warning**. Same count as the known baseline (26 errors, 1 warning). None of the findings are in the files changed for this task. They are in `supabase/functions/abos-ai-agent`, `abos-ai-eval`, `abos-ai-probe`, `whatsapp-send`, and a landing fast-refresh warning in `auth-modal.tsx`. Lint does not pass.
- `npm run build`: pass.
- `git diff --check` before the implementation commit: clean.

## Tests actually run

None of the ten product cases were executed against a live session or a database:

1. Create from a customer — not run.
2. Create from a lead without a customer — not run.
3. Create from a converted lead with a customer — not run.
4. Ordinary task — not run.
5. Reload persistence of names — not run. The select includes the names; persistence is not proven.
6. Open-task count refresh — not run. The customer effect depends on `detailRefresh`, which increments on success.
7. Cancel — not run. The cancel button only calls `onClose`.
8. Cross-business rejection — not run. The migration was not applied, so the trigger is not live.
9. Viewer direct insert/update — not run. No viewer session was used. Live policies were previously reported as owner/admin/agent; this task did not re-test them and did not change them.
10. Horizontal overflow at 360, 390, 430 — not run. Layout uses existing wrapping utilities only.

## Still untested

- Applying the migration on any database, including the preflight against live rows.
- Nested select FK names against the live PostgREST schema cache.
- Role denial for a real viewer token.
- Mobile layout in a browser.
- Vercel runtime behavior beyond the preview build.
