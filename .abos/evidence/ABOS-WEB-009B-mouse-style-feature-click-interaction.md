# ABOS-WEB-009B evidence

## Targeting

`featureTapPoint(id)` reads the visible card's `[data-cine="tap-target"]` title. It places the click on the title edge nearest the emblem, then steps 7px toward the title centre so the tip sits on the text. If the title is missing or smaller than 4px, the move is skipped. There is no fallback to the emblem or the stage centre.

Pointer offset uses `clientWidth` and `clientHeight`, not the rotated bounding box. Rotation is `atan2` from the emblem to that title point, with transform-origin on the SVG tip `(44, 24)`. The rendered tip is still read with `getScreenCTM()`.

## Click

On the same master timeline, after the 0.18s travel: scale to 0.86 for 0.06s, back to 1 over 0.1s, both around the tip. The card scales to 1.025 and back, `data-hot` turns on, and the ripple plays from the tip.

## Ripple

`.cine-ripple` is placed at `calc(91.67% - 8px)` and `calc(50% - 8px)` so its centre is the arrow tip. It is not using a transform for that offset, so GSAP scale does not move it off the tip.

## Timing kept

Beat 2.1s. Travel 0.18s. Press and release finish before the next target and before the beat clear at 1.90s. Full loop remains about 14.9s.

## Checks

- typecheck: pass
- production build: pass
- lint: 27 problems (26 errors, 1 warning), same baseline
- `git diff --check`: clean

## Not measured

No Chromium in this environment. No screenshot, recording, or pixel error between arrowhead and title. No Vercel preview.
