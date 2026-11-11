# ABOS-WEB-005 evidence

**Start:** `08aabeba3e9d219dea3db833c8fdddcce4d846a6`
**Branch:** `feature/landing-page-redesign`
**Main:** `1139d93dc9cf374166659db1e920047461f2de0e` (not modified)

## What changed

- Header above the stage keeps the exact `ABOS in motion` anchor (`data-cursor="motion-title"`). Desktop adds an emerald signal line, the line "From the first customer signal to connected business execution.", and `01 / 05 — {CHAPTERS label}`.
- Desktop rail (`lg` and up) uses the five existing chapter labels. Fill `scaleX` is set in the existing ScrollTrigger `onUpdate`. Chapter index still comes from `chapterFromProgress`. No second ScrollTrigger.
- Below `lg`, the rail is hidden. A wrapping label row shows the same five labels. The in-stage cursor scene is unchanged.
- Desktop stage max height is reduced (`clamp(300px, 46svh, 500px)`, `max-height: calc(100svh - 292px)`) so the header and rail fit inside the existing sticky host. `.cine-track` stays `158svh` / `182svh` at `min-width: 1024px`.

## Track and stage (local production build, dummy public Supabase env, not committed)

| Viewport | Track height | Stage height | Rail | Horizontal overflow |
|---|---|---|---|---|
| 1440×900 | 1638px (182svh) | 414px | visible | no |
| 1280×800 | 1456px (182svh) | 368px | visible | no |
| 768×900 | 1422px (158svh) | 504px | hidden | no |
| 390×844 | 1334px (158svh) | 448px | hidden | no |

Before this change the desktop stage rule was `clamp(340px, 56svh, 580px)` with `max-height: calc(100svh - 176px)`. Track CSS did not change.

Scroll sample at 1440×900, same timeline: progress 0.02 → Signal / `01 / 05 — SIGNAL`; 0.25 → Operations; 0.50 → Connected future with fill at `scaleX(1)`; scroll back to the track top → Signal and fill `scaleX(0.08)`. Business intelligence and Human control were not parked on in that sample; they use the same `chapterFromProgress` thresholds.

`Business Brain` was not present in the rendered text.

## Checks

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: 26 errors, 1 warning. Same baseline. None in the files changed here.
- `git diff --check`: clean

## Not claimed

- Owner phone or desktop visual acceptance.
- Vercel preview until the deployment for this commit is confirmed READY.
- Live Supabase. The layout numbers above used a local dummy `VITE_SUPABASE_URL` and publishable key so the app would mount. Those values were not written to the repo.
