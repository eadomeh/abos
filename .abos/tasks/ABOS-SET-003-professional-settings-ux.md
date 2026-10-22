# ABOS-SET-003 — Professional Settings UX and Organization

## Goal
Make Settings feel like a polished, conventional business application while preserving ABOS's dark visual identity and all existing settings behavior.

## Scope
- `src/components/pages/SettingsPage.tsx`: Settings shell, header and tab wiring.
- `src/components/settings/SettingsSectionNav.tsx`: reusable grouped category navigation.
- `src/components/settings/BusinessKnowledgeTab.tsx`: extract the existing Knowledge screen into a focused module without changing its data semantics.
- This task packet only; no schema migration or unrelated dashboard redesign.

## Acceptance criteria
- Settings categories are grouped by purpose and use consistent active, hover, focus and danger states.
- Desktop uses a clear sidebar/content layout; mobile stacks the category menu above the content and prevents horizontal overflow.
- The active business and member role are visible for context.
- Existing tab IDs, forms, business scoping, RLS reliance, role checks, WhatsApp behavior, and business-deletion safeguards remain intact.
- Business Knowledge behavior and validation remain equivalent after extraction.
- Only owner/admin can edit Knowledge; no delete control is introduced.
- An evidence record lists checks actually run and explicitly leaves manual behavior verification outstanding.
- Typecheck, production build, targeted ESLint and diff checks pass; unrelated untracked WhatsApp audit remains untouched and unstaged.

## Verification
The release runner must pass typecheck, production build, targeted ESLint and diff checks before promotion. Automated checks prove compile/build/lint/diff state only. After deployment, inspect Settings on a real phone and desktop, and verify section navigation, persistence and role behavior. Manual visual/role acceptance remains outstanding until it is actually completed.

## Rollback
Revert this task's commit; no database migrations or data changes are part of SET-003.
