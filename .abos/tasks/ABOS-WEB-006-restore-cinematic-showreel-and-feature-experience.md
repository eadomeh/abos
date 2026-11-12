# ABOS-WEB-006 — Restore the self-playing cinematic showreel

**Status:** IN REVIEW
**Branch:** `feature/landing-page-redesign`
**Baseline HEAD:** `88ac6df67a4531adcccc44364c01404ecc28c0c5`
**Source showreel:** `437980a93f4feabe9434c25d9a40da93369445db`
**Production main:** `1139d93dc9cf374166659db1e920047461f2de0e`

## Goal

Remove the scroll-scrub cursor film and the WEB-005 header/rail. Restore automatic GSAP playback from the original showreel, then play seven operating scenes inside the display.

## Scope

- `src/components/landing/cinematic-showcase.tsx`
- `src/index.css` cinematic rules only
- This packet and the matching evidence file

## Out of scope

Inbox, WhatsApp, other landing sections, auth, dashboard, Supabase, and `main`.
