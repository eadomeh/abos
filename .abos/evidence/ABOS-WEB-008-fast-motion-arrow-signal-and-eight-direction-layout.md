# ABOS-WEB-008 evidence

## Timing (source constants, not a filmed loop)

- `BEAT = 2.1`
- Arrow travel `TRAVEL = 0.18`
- Repeat delay `0.2`
- Active timeline length: `7 * 2.1 = 14.7` seconds
- Full loop including repeat delay: `14.9` seconds
- Ordinary moves at `0.30` and `1.05`; they finish at `1.23`, before the `1.90` clear
- Command-centre moves at `0.12`, `0.55`, `0.98`, `1.41`; last arrival `1.59`, before the `1.90` clear

## Zones used across the seven beats

NW, N, NE, E, SE, S, SW, W. Phone widths remap E toward the top-right and W toward the lower-left so side cards do not sit on the emblem.

## Signal line

`arrowhead()` converts SVG viewBox tip `(5.2, 3.4)` through the rendered SVG box. The cursor wrapper is offset so that tip lands on the card anchor. `syncWire()` rebuilds the quadratic from the emblem edge to that tip on the same GSAP travel tween. The pulse progress `0 → 1` samples `getPointAtLength` on the current path.

## Checks run

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: 27 problems (26 errors, 1 warning), same recorded baseline
- `git diff --check`: clean

## Not run

Viewport screenshots, screen recordings, and a Vercel preview were not produced in this session. Owner visual acceptance remains open.
