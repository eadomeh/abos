# ABOS-SET-004 — Mobile Settings Detail Navigation

## Goal
Make each Settings category open as a distinct mobile detail screen with an obvious back control.

## Acceptance criteria
- On mobile, Settings initially displays the category menu without showing the Business form underneath it.
- Selecting Business Profile, AI Agent, Business Knowledge, WhatsApp, Team & Permissions, or Danger Zone opens only that category's detail content.
- The detail screen shows a clear “Back to Settings” control at the top; using it returns to the category menu.
- Desktop keeps the current grouped sidebar and content panel visible together.
- Existing category IDs, forms, saving behavior, business scoping, RLS reliance, role checks, WhatsApp flow and deletion safeguards remain unchanged.
- No database/schema change and no unrelated files.

## Verification
Run TypeScript typecheck, production build, targeted ESLint and `git diff --check`. Production deployment must be checked against the exact pushed commit. Real phone interaction remains a user-acceptance check and must not be reported as tested until performed.

## Rollback
Revert the SET-004 commit; no data migrations or database changes are part of this task.
