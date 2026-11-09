# ABOS-WEB-001 — Premium Landing Page

**Status:** IN PROGRESS — Slice 1 exists on `feature/landing-page-redesign`; stylesheet recovery required before further visual work

## Goal

Build a premium ABOS marketing landing experience on a feature branch without disturbing production, auth, Ask ABOS, the WhatsApp demo, the Africa map, dashboard, or backend.

## Branch

- Repository: `eadomeh/abos`
- Branch: `feature/landing-page-redesign` (retained; do not open a second landing branch for this recovery)
- Production baseline at task inspection: `1139d93dc9cf374166659db1e920047461f2de0e` (`main`)
- Recovery starts from branch HEAD `510c218ec09cc7301c0d119ce35f3ca3d72c66c5` after governance commit ABOS-OPS-003

## Already on the branch (do not expand in the recovery commit)

- GSAP + Lenis landing-stage foundation (`src/lib/landing-stage.ts`)
- Hero gradient / stage classes and nav glass styles
- Refined SVG crystal mark and inline vector variant (candidate, not accepted final brand)
- Tailwind design-token updates
- Open Graph metadata

## Known defect

`src/index.css` on this branch is a short replacement. `main` holds the full ABOS stylesheet (~1032 lines, ~70 custom class selectors, 29 keyframes). Commit `5818978` wrote the literal `PLACEHOLDER`. Commit `510c218` restored only a small base, not the original rules. A Vercel build of `5818978` failed PostCSS `Unknown word` at `src/index.css:1:1`.

A later `READY` build only proves compilation. It does not restore WhatsApp, map, animation, ambient, Ask ABOS, or other custom styles.

## Recovery requirements

1. Restore the entire `src/index.css` from `main` at `1139d93dc9cf374166659db1e920047461f2de0e`.
2. Reapply only the additive landing rules from `75a747b6edc0cf29cead4ad881e224a8abb494c5`: `.site-nav`, `.hero-signal-line`, `.hero-stage` and `::before`, `html.abos-gsap` (including `.hero-intro` animation override), and the reduced-motion fallback for `.hero-signal-line`.
3. Keep every original selector, keyframe, and reduced-motion rule unless a documented conflict requires a small additive override.
4. Do not change other components, the SVG mark, `landing-stage.ts`, auth, Ask ABOS, WhatsApp demo, Africa map, dashboard, workspace, or backend in the CSS recovery commit.
5. Confirm `PLACEHOLDER` is absent from source.
6. Run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Non-goals for the recovery commit

- No new features, logo revisions, dependencies, Supabase changes, auth rewrites, or dashboard redesign.
- No merge and no production promotion. Vercel preview is enough.
- The crystal mark stays a candidate until a separate Gemini and ChatGPT review of distinctiveness, small-size legibility, and consistent usage.

## Acceptance criteria

- [ ] Stylesheet diff against `main` is additive on top of the full original file.
- [ ] All 29 original keyframe names and all 70 original unique custom class names remain, plus the landing additions.
- [ ] Phase B touches only `src/index.css` (plus this packet if it must record evidence; prefer the CSS file alone).
- [ ] Checks above have actually run and their results are reported.
- [ ] Production branch and `abos-tau.vercel.app` are unchanged.

## Rollback

Revert the CSS recovery commit. Production is unchanged because this branch is not `main`.
