# ABOS-WEB-004 evidence

Starting SHA: `1f4deab3a42d30d83208af16f067cf33aec4645e`
Branch: `feature/landing-page-redesign`
Production `main` at check: `1139d93dc9cf374166659db1e920047461f2de0e`

## What changed

- Cinematic section is a five-stage path. Wide viewports at least 900px wide and taller than 560px use a `190svh` track and a stage of `clamp(360px, 60svh, 600px)`. Narrower widths, short viewports, and reduced motion use a static vertical list. Stage buttons scroll the track or the matching step.
- WhatsApp demo no longer renders Business Brain, thread-context panels, phone/video controls, or the illustrative next-step bubble.
- In Action is a sample operations desk: inbox, thread, and a context pane with local suggestion preview labelled "Preview only · not sent".
- `LiveRail` is not rendered. `live-rail.tsx` was not deleted.

## Checks

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: exit 1, 26 errors and 1 warning. Same known baseline in `supabase/functions/*` and `auth-modal.tsx`. No new scoped landing errors.
- `git diff --check`: pass after removing a trailing blank line.

## Not run

Playwright and device browsers were not run. Viewport layouts at 360, 390, 430, 820, 900, 960, 980, 1024, 1440, reduced motion, and short height were not visually verified in a browser. Owner review on Android is still required.
