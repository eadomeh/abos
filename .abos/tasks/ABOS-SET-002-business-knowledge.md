# ABOS-SET-002 — Business Knowledge Settings

## Goal
Allow each business to maintain verified AI knowledge from Settings without changing the established layout or touching payment/bank data.

## Acceptance criteria
- Settings shows a vertical Knowledge section on desktop and a usable stacked layout on mobile.
- Entries are always queried and updated with the active `business_id`; RLS remains the server-side authorization boundary.
- Owner/admin can add, edit, and activate/deactivate entries. Agent/viewer roles are read-only.
- Required title/content and category/content-length limits are validated before saving.
- Loading, empty, error, save-success and saving states are visible. Entries can be retired by setting `active=false`; no delete action is exposed.
- The existing AI retrieval function continues to consume active entries only. No migration is expected because `business_knowledge` already exists.

## Scope
`src/components/pages/SettingsPage.tsx` plus this task record. No schema migration and no payment-related fields.

## Verification
Run typecheck, production build, targeted ESLint and `git diff --check` before commit. Preview and mobile visual acceptance remain required before production promotion.
