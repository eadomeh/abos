# ABOS-WEB-005 — Cinematic signal header and journey rail

**Status:** IN REVIEW
**Branch:** `feature/landing-page-redesign`
**Baseline HEAD:** `08aabeba3e9d219dea3db833c8fdddcce4d846a6`
**Production main:** `1139d93dc9cf374166659db1e920047461f2de0e`

## Goal

Use the desktop space above and below the existing ABOS in Motion stage. Add a signal header and a five-stage rail driven by the existing ScrollTrigger progress. Do not redesign the scene.

## Scope

- `src/components/landing/cinematic-showcase.tsx`
- `src/index.css`
- This packet and `.abos/evidence/ABOS-WEB-005-cinematic-signal-header-and-journey-rail.md`

## Rules

- Keep the heading text `ABOS in motion` and `data-cursor="motion-title"`.
- Rail labels are the existing `CHAPTERS` labels: Signal, Business intelligence, Operations, Human control, Connected future.
- One ScrollTrigger. No click-to-scroll. No second timeline.
- Do not change track height (`158svh` base, `182svh` from 1024px).
- Do not edit the inbox, WhatsApp thread, other landing sections, Supabase, or production.
