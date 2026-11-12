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
