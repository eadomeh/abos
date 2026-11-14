# ABOS-WEB-009 evidence

## What changed

- Mobile stage uses `aspect-ratio: 5 / 4` and `min-height: 280px`. From 640px up it returns to `16 / 9`.
- The in-display "Illustrative product preview" pill is gone. One centered status reads `02 / 07 · CUSTOMER 360`.
- Pause and replay sit in a centered bottom dock, above the progress bar.
- The pointer is a right-facing ABOS navigator (white arrowhead, emerald core, twin fins), 34px on small screens and 40px from 640px. It rotates with travel. Tip is SVG `(44, 24)`, read with `getScreenCTM()`.
- The tether is a 2.4px emerald stroke with a glow. It ends at that transformed tip. The card anchor is 5px outside the card rectangle, toward the emblem.
- Detail copy no longer uses line-clamp. Status chips can wrap.
- Beat length stays 2.1s, travel 0.18s, loop about 14.9s including the 0.2s repeat delay.
- Below 640px, the E slot moves to the top band and the W slot to the lower band so side cards do not cover the emblem.

## Checks

- typecheck: pass
- production build: pass
- lint: 27 problems (26 errors, 1 warning), same baseline
- `git diff --check`: clean

## Not measured

This environment has no Chromium. Viewport screenshots, a screen recording, rendered stage pixel sizes, and arrowhead-to-path error in pixels were not captured. Those remain owner acceptance checks. No Vercel preview was created here.
