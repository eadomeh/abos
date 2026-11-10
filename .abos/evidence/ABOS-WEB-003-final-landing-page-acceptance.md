# ABOS-WEB-003 evidence

Measured with Playwright Chromium, headless.

- Before: Vite dev of `1416401079597a5bd897cf63262b6e34395288e2`.
- After: `vite preview` of the local production build of this branch.
- Mobile viewport height 844px except the 360px before/after document row, which used 800px on the first pass. Desktop viewport 1440×900.
- A dummy `VITE_SUPABASE_PUBLISHABLE_KEY` was used only so the client could boot. It was not committed.

## Heights (px)

| Viewport | Metric | Before | After | Change |
|---|---|---:|---:|---:|
| 360 | document | 12715 | 11884 | −6.5% |
| 360 | cine track | 2363 | 2363 | 0 (still 280svh) |
| 360 | network | 1544 | 1352 | −12.4% |
| 360 | platform | 1424 | 1168 | −18.0% |
| 360 | think | 1339 | 955 | −28.7% |
| 390 | document | 12438 | 11589 | −6.8% |
| 390 | network | 1564 | 1367 | −12.6% |
| 390 | platform | 1345 | 1117 | −17.0% |
| 390 | think | 1284 | 860 | −33.0% |
| 430 | document | 12106 | 11310 | −6.6% |
| 430 | network | 1560 | 1328 | −14.9% |
| 430 | platform | 1297 | 1077 | −17.0% |
| 430 | think | 1184 | 840 | −29.1% |
| 1440 | document | 11298 | 10758 | −4.8% |
| 1440 | cine track | 2700 | 2160 | −20.0% (300svh → 240svh) |
| 1440 | showcase | 2951 | 2411 | −18.3% |
| 1440 | network | 1463 | 1463 | 0 |
| 1440 | platform | 1209 | 1209 | 0 |

Horizontal overflow was false at 360, 390, 430, and 1440 on the after build.

## Auth mark

At 360px, Get Started opened the dialog. Image `src` was `/abos-mark.png`, rendered 56×44 (source ratio 806×630, not cropped). Title read "Create your ABOS account". Close control present.

## Commands

- `npm run typecheck`: exit 0
- `npm run build`: exit 0
- `git diff --check`: exit 0
- `npm run lint`: exit 1. Pre-existing errors in `supabase/functions/*` (26 errors). Landing change did not add a new lint error. Existing warning remains in `auth-modal.tsx` (`react-refresh/only-export-components`) because `useAuthUi` is exported from that file.

## Not proven here

- Full GSAP chapter walk on a physical phone.
- Owner visual acceptance.
- Vercel READY status is recorded in the commit that follows deployment, or in the handoff if the deployment URL is known after push.
