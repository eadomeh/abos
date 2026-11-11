# ABOS-WEB-004 evidence

Starting SHA: `1f4deab3a42d30d83208af16f067cf33aec4645e`
Branch: `feature/landing-page-redesign`
Production `main` at check: `1139d93dc9cf374166659db1e920047461f2de0e`

## What changed

- Cinematic section is a five-stage path. Wide viewports at least 900px wide and taller than 560px use a `190svh` track and a stage of `clamp(360px, 60svh, 600px)`. Narrower widths, short viewports, and reduced motion use a static vertical list. Stage buttons scroll the track or the matching step.
- WhatsApp demo no longer renders Business Brain, thread-context panels, phone/video controls, or the illustrative next-step bubble.
- In Action is a sample operations desk: inbox, thread, and a context pane with local suggestion preview labelled "Preview only · not sent".
- `LiveRail` is not rendered. `live-rail.tsx` was not deleted.

## Checks at f9bc2bb

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: exit 1, 26 errors and 1 warning. Same known baseline in `supabase/functions/*` and `auth-modal.tsx`. No new scoped landing errors.
- `git diff --check`: pass after removing a trailing blank line.

## Correction pass

Started from `f9bc2bb17e3491e56ac65c7f3f45b773a993fdb6`.

- Headline "One business. One connected intelligence." is shifted onto the path's x origin and a stem continues into the existing path start.
- Five anchors are placed with `path.getPointAtLength` at 9%, 28%, 48%, 68% and 88% of the same path. The active anchor is bright. The others stay small.
- One label pill is shown. An SVG leader and end dot connect it to that anchor. The pill fades in over 300ms. Scroll and the stage buttons share `stageFromProgress`.
- The marker is an arrowhead rotated to the path tangent. Reverse scrub still drives the same function.
- Desktop story track remains `190svh`. The sticky stage remains `clamp(360px, 60svh, 600px)`. Below 900px, under 561px tall, or reduced motion: static vertical list, no pin.
- `workflowFromVisible` reads the last visible message side and `product` flag. A catalog sentence is used only when that message is marked `product`.
- WhatsApp status text is "sample conversation". The presence dot is gone.

## Not run

No browser, viewport, or device pass was run in this correction. Playwright and device browsers were not run. Owner review of the new preview is still required.
