# ABOS-WEB-006 evidence

**Start:** `88ac6df67a4531adcccc44364c01404ecc28c0c5`
**Showreel source inspected:** `437980a93f4feabe9434c25d9a40da93369445db`
**Main:** `1139d93dc9cf374166659db1e920047461f2de0e` (not modified)

## Restored

Automatic GSAP timeline, `repeat: -1`, IntersectionObserver at 0.35, `visibilitychange` pause, pause/resume, replay via `restart()`, scene label, progress bar, reduced-motion poster. Section copy is again "ABOS in motion", "One business. One connected intelligence.", and the illustrative-data disclaimer. Stage is `aspect-video` from `md` up and `aspect-[4/5]` below, with no scroll track and no WEB-005 stage shrink.

Removed: travelling cursor, ScrollTrigger inside this component, signal header, five-stage rail.

## Scenes (one timeline, 3.7s each)

1. Customer signal — Ikeja / black enquiry, customer card, enquiry received.
2. Customer 360 — prior thread, catalogue match, next action. Availability is not assumed.
3. Business intelligence — the specified suggested reply, saved sources, no guessed stock/price/policy/delivery.
4. Inventory and order — stock check required, order draft, awaiting confirmation.
5. Payment — transfer claim pending verification, not settled, no success state.
6. Delivery and handoff — delivery not confirmed, task assigned, handoff required.
7. Command centre — module cards plus "One business. One connected intelligence." Analytics card is labelled illustrative demo data. No numeric chart is shown.

## WEB-006A (from `6aecc19`)

In-display pointer (not a page cursor, not ScrollTrigger, not mouse-follow). Tip position is computed from each `[data-target]` box. Emerald quadratic path and travelling dot render only when the stage is at least 768px wide. `data-hot` glow plus ripple on arrival. Analytics card has an SVG bar chart labelled `ILLUSTRATIVE DEMO DATA`. Scene 07 uses a 2-column compact grid below `md`, and the stage is `40rem` tall below `md` so those cards fit.

Forced scene 07 visible and compared each card box to the stage box:

| Viewport | Stage | Cards clipped | Cursor in stage | Page overflow x |
|---|---|---|---|---|
| 390×844 | 358×640 | no (6/6) | yes | no |
| 360×800 | 328×640 | no (6/6) | yes | no |
| 768×900 | 704×396 | no (6/6) | yes | no |
| 1280×800 | 1216×684 | no (6/6) | yes | no |
| 1440×900 | 1360×765 | no (6/6) | yes | no |

Playback architecture unchanged: one timeline, viewport and tab pause, pause/resume, replay, loop, reduced-motion poster. Arrow, wire, hot state, and chart bars are tweens on that timeline. Halo tween stays inside `gsap.context`.

Commands after the change: typecheck exit 0, build exit 0, `git diff --check` exit 0. Lint still 26 errors and 1 warning, all pre-existing (`supabase/functions/*` and `auth-modal.tsx` react-refresh). No new lint issue.


## Local production preview (dummy public Supabase env, not committed)

| Viewport | Stage | Aspect | Overflow x |
|---|---|---|---|
| 1440×900 | 1360×765 | 1.78 | no |
| 1280×800 | 1216×684 | 1.78 | no |
| 768×900 | 704×396 | 1.78 | no |
| 390×844 | 358×448 | 0.80 | no |

All seven scene labels appeared in order on 1280×800. Pause set `aria-pressed=true`. Replay returned the label to scene 01. No cursor anchor and no `.cine-track`.

Off-screen pause and hidden-tab pause are implemented with the same observer and `visibilitychange` listener as the original showreel. This run did not separately log those two cases.

## Checks

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: 26 errors, 1 warning. Same baseline. None in the files changed here.
- `git diff --check`: clean

## Not claimed

Owner visual acceptance. Vercel READY until this commit's deployment is confirmed.
