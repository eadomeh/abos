# ABOS-WEB-008 — Fast motion, arrow-locked signal, eight-direction layout

**Status:** IMPLEMENTED — owner visual acceptance still open

## Branch

- `feature/landing-page-redesign`
- Start: `84cd947807fdbf6bb1bad00ba84f30e2b5b18b39`
- `main` must stay `1139d93dc9cf374166659db1e920047461f2de0e`

## Scope

- `src/components/landing/cinematic-showcase.tsx`
- `src/index.css`
- This task file and `.abos/evidence/ABOS-WEB-008-fast-motion-arrow-signal-and-eight-direction-layout.md`

## Requirements

- Seven-beat self-playing showreel near 14–16 seconds.
- Arrow travel about 0.18s, cards enter in about 0.2s.
- Signal path starts at the emblem edge and ends at the rendered SVG arrowhead tip.
- Pulse uses `getTotalLength` / `getPointAtLength` on that same path.
- Cards use eight slots: NW, N, NE, E, SE, S, SW, W.
- No ScrollTrigger. No production or Supabase changes.
