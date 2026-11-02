# A2 — Mobile navigation performance measurements

**Status:** INSTRUMENTATION READY — PHONE MEASUREMENTS NOT YET RECORDED
**Baseline commit:** `f098b9240f103fe1e99388c35b88f5eea42c5221`
**Measurement target:** `https://abos-tau.vercel.app`
**Scope:** N1 navigation performance — A2 measurement only; A3 fixes remain separate.

## Test conditions

- Device: Tecno Pop 8 / Android Chrome (record exact Chrome version when available).
- Network: record actual network type and signal conditions; do not claim a throttled profile for phone runs.
- App state: authenticated workspace, same business for all runs.
- Each target page: first visit and at least one repeat visit after navigating away.
- Instrumentation: `?debug=1`; PageSpeed Insights should be run on the clean production URL without `?debug=1`.

## PageSpeed Insights — Mobile

| Run date | Performance score | LCP | Total Blocking Time | Unused JavaScript opportunity | Notes |
|---|---:|---:|---:|---:|---|
| UNMEASURED | — | — | — | — | Run at https://pagespeed.web.dev/ for the production URL, Mobile. |

## Phone capture steps

1. Open the production site in the already-authenticated Chrome session with `?debug=1` added to the URL. Eruda loads only for this explicit debug URL.
2. Visit Products, Conversations, and Settings → WhatsApp. For each, leave the page and return once to capture a repeat visit. Wait until each page has finished showing its main content.
3. In Eruda Console, run `await window.__abosPerfCopy()` and paste the copied report into the A2 evidence record. It contains only sanitized Supabase request paths, methods, statuses, durations and exposed content-length values.
4. In Eruda Network, inspect each of the three navigation visits for total transferred KB, browser asset requests, Meta SDK timing and WebSocket activity. Do not share raw request headers, payloads or customer data.
5. Run PageSpeed Insights separately against the clean production URL (no `?debug=1`) using Mobile.

## Per-page navigation summary

| Page | Visit | Supabase request count | Slowest Supabase request | Known Supabase content length (KB) | Full navigation transfer (Eruda KB) | Time until content appears (ms) | Notes |
|---|---|---:|---|---:|---:|---:|---|
| Products | First visit | UNMEASURED | — | — | — | — | — |
| Products | Repeat visit | UNMEASURED | — | — | — | — | — |
| Conversations | First visit | UNMEASURED | — | — | — | — | — |
| Conversations | Repeat visit | UNMEASURED | — | — | — | — | — |
| Settings → WhatsApp | First visit | UNMEASURED | — | — | — | — | Include WhatsApp status function and inspect Meta SDK in Eruda Network. |
| Settings → WhatsApp | Repeat visit | UNMEASURED | — | — | — | — | — |

## Slowest request detail

| Page / visit | Method | Sanitized path | Status | Duration (ms) | Content length (bytes) |
|---|---|---|---:|---:|---:|
| UNMEASURED | — | — | — | — | — |

> The in-app report records Supabase fetch request durations and response content length only when the header is exposed. Eruda Network captures browser assets, lazy chunks (if any), and the Meta SDK. Missing content-length values are unknown, not zero. No request query strings, headers, tokens, bodies, response data, customer names, or messages are recorded.

## Hypothesis assessment (do not mark confirmed without evidence)

| Hypothesis | What to inspect | Result |
|---|---|---|
| H1 — request waterfall / sequential requests | Timing order of independent requests on the critical path | UNMEASURED |
| H2 — repeat fetch / no cache | Compare first and repeat visits, including request count and durations | UNMEASURED |
| H3 — JavaScript bundle / route loading | PageSpeed unused JS and Eruda Network asset/chunk timing | UNMEASURED |
| H4 — Edge Function on critical path | WhatsApp status function timing and when the tab content becomes visible | UNMEASURED |
| H5 — realtime / websocket churn | Eruda Network WebSocket activity and reconnects during navigation | UNMEASURED |
| H6 — Auth lock contention | Console warnings and stalls during tab/app return | UNMEASURED |
| H7 — image transfer size | Image requests, resource sizes, and whether they block visible content | UNMEASURED |
| H8 — font loading | Font request timing and text-render delay | UNMEASURED |

## A2 conclusion

**Root cause:** NOT YET DETERMINED.
**A3 recommendation:** WAIT for the completed measurements. Select the smallest fixes supported by the slowest critical-path work.

## Acceptance record

- [ ] PageSpeed Mobile values saved.
- [ ] Products first + repeat visit measured.
- [ ] Conversations first + repeat visit measured.
- [ ] Settings → WhatsApp first + repeat visit measured.
- [ ] Slowest requests per page recorded.
- [ ] H1–H8 hypotheses assessed using the evidence.
- [ ] No A3 performance fixes included in A2.
