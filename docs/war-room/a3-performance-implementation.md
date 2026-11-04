# ABOS A-3 implementation checkpoint

Base revision: `3662b34b0f08f837e68fc3bc30e29938a9e170ec` (audited `main`, 4 Nov 2026).

## Included changes

- Code-split the landing, auth and workspace entry points and each workspace page.
- Prefetch route chunks on pointer hover, keyboard focus and touch start.
- Introduce TanStack Query with a 30-second stale window and 15-minute garbage collection.
- Cache dashboard bootstrap data, Products rows, the Conversations list and WhatsApp connection status.
- Add `public.get_workspace_bootstrap(...)`, a read-only JSON RPC using `SECURITY INVOKER`, an explicit business-membership check, existing RLS, and authenticated-only EXECUTE.
- Keep a narrow compatibility path using the existing RLS-protected dashboard reads until the SQL migration has been applied and is visible in PostgREST's schema cache.
- Consolidate the Conversations list and selected-thread message listeners into one channel per active business.
- Remove the Google Fonts stylesheet dependency in favour of the existing local General Sans font, preload the local Clash Display 600 font, and render the H1 without its entrance delay.
- Move animated map-flight positioning from per-frame `left`/`top` writes to transform-only writes, using ResizeObserver for container dimensions.

## Security and data integrity

The bootstrap RPC does not return payment settings, bank details, WhatsApp tokens, or other secrets. It is `SECURITY INVOKER`; it retains the caller's table grants and RLS. It checks `auth.uid()` and `private.is_business_member(p_business_id)`, and revokes EXECUTE from `PUBLIC` and `anon`. The function only reads dashboard metrics and small recent-activity projections. No payment/order state transitions are altered.

The Conversations realtime channel is scoped by `business_id`; RLS remains the authority for row visibility. Message events are applied only when their conversation matches the currently selected thread.

## Rollout order

1. Run the Termux release script from the clean audited `main` checkout. It refuses a dirty tree, unexpected branch, source hash drift or remote `main` advancement.
2. It installs the TanStack Query v5 dependency, runs `typecheck`, `lint`, `build`, and `git diff --check`, then commits and pushes only the task files.
3. Verify the pushed SHA and Vercel production deployment.
4. Apply this exact migration to Supabase after the code commit is confirmed. Until then, the dashboard falls back to the existing RLS-protected parallel queries.
5. Confirm `get_workspace_bootstrap` appears in the migration ledger and run owner/admin/agent/viewer cross-business access checks.

## Acceptance still required on the real phone

- Products, Conversations and Settings revisit from cache without blanking while stale data quietly refreshes.
- Selected-thread messages, delivery status, scroll anchoring, unread state and retry behaviour remain correct with one realtime channel.
- Viewer stays read-only through direct API attempts as well as UI controls.
- Compare public landing PSI after release; supplied 3 Nov PSI is evidence for `/` only, not authenticated workspace navigation.
- Verify a member cannot call the bootstrap RPC for another business (expected SQLSTATE `42501`) and that `anon` cannot execute it.

## Validation boundary

The ZIP is based on reviewed source blob hashes and has guarded patch preconditions. The actual TypeScript, lint, production-build, Git push, Supabase migration application, Vercel deployment and mobile acceptance checks run in the user's Termux/live environment; they are not represented as already completed by preparing this package.
