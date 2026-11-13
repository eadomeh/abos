# ABOS-WEB-007 evidence

Visual reference used: historical floating-card stage in `1f4deab` and autoplay timeline in `437980a`. ScrollTrigger from those commits was not restored. The owner recording file was not in the workspace, so the recording itself was not frame-matched.

## Stage size (Playwright, local preview)

| Viewport | Stage px | Ratio | Overflow | Clipped cards |
|---|---|---|---|---|
| 1440×900 | 1360×765 | 1.78 | no | no |
| 1280×800 | 1216×684 | 1.78 | no | no |
| 768×900 | 704×396 | 1.78 | no | no |
| 390×844 | 358×201 | 1.78 | no | no |
| 360×800 | 328×185 | 1.78 | no | no |

Opening frame on each size showed the emblem, enquiry and context cards, a pointer on the enquiry card, and a wire path from the emblem. Payment frame showed the transfer-claim and human-review cards with the pending-verification label. Finale frame showed customers, commerce, the illustrative chart, and the connected-intelligence line. Emblem stayed visible in all four captures.

Pause set `aria-pressed` to true. Replay returned the label to `01/07 Customer signal`.

## Commands

- typecheck: exit 0
- build: exit 0
- `git diff --check`: exit 0
- lint: 26 errors and 1 warning, same pre-existing `supabase/functions` and `auth-modal.tsx` findings. No cinematic lint hit.
