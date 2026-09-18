# ABOS Development Rules

1. **No builder owns ABOS.** Generated code can be accepted only after review and committed into Git.
2. **No secrets in client code.** Only frontend-safe Supabase keys may be exposed to the browser.
3. **Every tenant query is business-scoped.** Prefer server-side authorization plus RLS over client-only checks.
4. **Every external webhook is authenticated and idempotent.** Verify signatures and enforce unique event IDs.
5. **Every feature has a failure state.** Loading, empty, success, and error states are required.
6. **Every schema change is a migration.** Never hand-edit production tables without recording the migration.
7. **Build before polish.** We optimize for a working, testable vertical slice before adding cosmetic complexity.
8. **Revenue is the product metric.** Features should map to lead response, conversion, retention, order value, or operator efficiency.
