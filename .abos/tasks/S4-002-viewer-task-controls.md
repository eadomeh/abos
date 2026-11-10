# S4-002 — Viewer task controls

**Status:** READY FOR OWNER REVIEW. Live same-business trigger is BLOCKED.

## Branch

- `feature/slice-4-linked-follow-up-tasks`
- Starting HEAD verified: `5a06556b22d1e5f58aa957741ccf82af6e29925b`
- `main` baseline verified: `1139d93dc9cf374166659db1e920047461f2de0e`

## Defect

Viewers did not see New task, but the completion toggle and status `<select>` were still rendered.

## Fix

`canWriteTasks` (owner, admin, agent) now also gates the completion control and the status selector. Viewers see a non-interactive status badge. Delete stays owner-only. Create follow-up on customers and leads was already role-gated.

## Migration

`supabase/migrations/20261110110000_tasks_same_business_links.sql` remains unapplied. No isolated non-production database was available. Do not apply it to production from this task.
