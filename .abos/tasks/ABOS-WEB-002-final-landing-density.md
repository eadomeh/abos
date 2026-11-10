# ABOS-WEB-002 — Final landing density

**Status:** IN PROGRESS

## Goal

Apply the owner's final visual-density refinements after accepting the previous landing preview.

## Branch

- Repository: `eadomeh/abos`
- Branch: `feature/landing-page-redesign`
- Starting HEAD: `643506a7d1a8e34f1ea78f5ba61c93df730eaee6`
- Production `main`: `1139d93dc9cf374166659db1e920047461f2de0e`

## Scope

- `src/index.css`
- `src/components/landing/network-section.tsx`
- `src/components/landing/features-section.tsx`
- `src/components/landing/agent-console.tsx` only if required for compact mobile presentation

## Requirements

- Desktop `.cine-track` at `min-width: 1024px` moves from `330svh` to approximately `300svh`.
- Base / mobile `.cine-track` stays `280svh`.
- Preserve all five cinematic chapters, cursor path, wires, module states, ScrollTrigger, progress, reverse scroll, sticky stage under the nav, reduced-motion poster, and short-viewport fallback.
- Do not shorten or redesign the WhatsApp demo.
- Network section is shorter on narrow mobile: less section padding, less gap between heading, map, and details, a compact selected-city card, and one supporting person row. All person rows remain visible at `sm` and above. Every city button stays functional. The Africa map is not cropped or hidden.
- Platform section is shorter on narrow mobile: less section padding, less grid margin, less card padding, less gap between icon and heading, tighter description spacing. All four pillars, order, wording, and icons stay. Desktop/tablet spacing at `sm` and above stays generous.

## Non-goals

- Do not edit `src/components/landing/whatsapp-section.tsx` or `src/components/landing/whatsapp-thread.tsx`.
- Do not redesign the hero, navigation, footer, map artwork, or brand mark.
- Do not rewrite the global scroll system.
- No new dependencies.
- No Supabase, database, Edge Function, environment-variable, or production deployment changes.
- Do not start Slice 4 implementation in this task.
