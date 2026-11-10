# S4-002 evidence

## Verified from source

- `TasksPage` previously rendered the done toggle and status `<select>` for every role. New task was already hidden unless `canWriteTasks`.
- After the fix, both controls render only when role is owner, admin, or agent. Viewers get a read-only status label (`To do`, `In progress`, `Done`). Delete remains `role === 'owner'`.
- `CustomersPage` and `LeadsPage` already gate Create follow-up with the same three roles.
- Embedded select uses `customers!tasks_related_customer_id_fkey` and `leads!tasks_related_lead_id_fkey`. Those names match the default constraint names from `related_customer_id uuid references public.customers(id)` and the lead equivalent in `20260921174026_20260921090000_abos_operating_core.sql`. Not executed against live PostgREST in this session.
- Migration `supabase/migrations/20261110110000_tasks_same_business_links.sql` reviewed: preflight raises and does not rewrite rows; trigger checks both FKs against `new.business_id`; null links allowed; `search_path` is empty; function is not `SECURITY DEFINER`; grants revoked from public, anon, and authenticated; existing RLS statements are untouched. **Not applied.** No staging database was available. Live trigger proof is BLOCKED.

## Commands on this branch after the source edit

- `npm run typecheck`: exit 0
- `npm run build`: exit 0
- `git diff --check`: exit 0
- `npm run lint`: 26 pre-existing errors in `supabase/functions/*`, plus the existing `auth-modal.tsx` react-refresh warning. No new TasksPage lint finding.

## Not run

- Signed-in owner/admin/agent create-follow-up against production.
- Viewer session or viewer JWT write attempt.
- Mobile overflow screenshots of the tasks queue.
- Database integration of the same-business trigger.
