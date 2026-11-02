type PerfContext = { page: string; visitId: number } | null;
type PerfRequest = {
  page: string;
  visitId: number;
  method: string;
  path: string;
  status: number | null;
  durationMs: number;
  contentLengthBytes: number | null;
};
type PerfVisit = {
  id: number;
  page: string;
  visitNumber: number;
  startedAt: number;
  readyMs: number | null;
};
type PerfState = {
  visits: PerfVisit[];
  requests: PerfRequest[];
  visitCounts: Record<string, number>;
  current: PerfVisit | null;
  nextVisitId: number;
};
type PerfWindow = Window & {
  __abosPerfState?: PerfState;
  __abosPerfReport?: () => string;
  __abosPerfCopy?: () => Promise<string>;
  eruda?: { init: () => void };
};

export const isPerfDebugEnabled =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1';

function getState(): PerfState | null {
  if (!isPerfDebugEnabled || typeof window === 'undefined') return null;
  const w = window as PerfWindow;
  if (!w.__abosPerfState) {
    w.__abosPerfState = {
      visits: [],
      requests: [],
      visitCounts: {},
      current: null,
      nextVisitId: 1,
    };
  }
  return w.__abosPerfState;
}

export function initPerfDebug(): void {
  const state = getState();
  if (!state || typeof document === 'undefined') return;

  const w = window as PerfWindow;
  if (w.__abosPerfReport) return;

  const report = (): string => {
    const current = getState();
    if (!current) return 'ABOS performance diagnostics are disabled.';
    const fmt = (value: number | null) => value === null ? 'n/a' : String(Math.round(value));
    const lines = [
      '# ABOS A2 — Mobile navigation measurements',
      `Captured: ${new Date().toISOString()}`,
      '',
      '| Page | Visit | Requests | Content ready (ms) | Slowest request (ms) | Known Supabase content length (KB) | Unknown sizes |',
      '|---|---:|---:|---:|---:|---:|---:|',
    ];

    for (const visit of current.visits) {
      const requests = current.requests.filter((entry) => entry.visitId === visit.id);
      const slowest = requests.reduce<PerfRequest | null>(
        (best, entry) => !best || entry.durationMs > best.durationMs ? entry : best,
        null,
      );
      const knownBytes = requests.reduce((sum, entry) => sum + (entry.contentLengthBytes ?? 0), 0);
      const unknownSizes = requests.filter((entry) => entry.contentLengthBytes === null).length;
      const visitLabel = visit.visitNumber === 1 ? 'first' : `repeat ${visit.visitNumber - 1}`;
      lines.push(
        `| ${visit.page} | ${visitLabel} | ${requests.length} | ${fmt(visit.readyMs)} | ${fmt(slowest?.durationMs ?? null)} | ${knownBytes ? (knownBytes / 1024).toFixed(1) : 'n/a'} | ${unknownSizes} |`,
      );
    }

    lines.push('', '## Slowest Supabase requests per visit (up to 3)', '', '| Page / visit | Method | Safe path | Status | Duration (ms) | Content length (bytes) |', '|---|---|---|---:|---:|---:|');
    for (const visit of current.visits) {
      const slowestForVisit = current.requests
        .filter((entry) => entry.visitId === visit.id)
        .sort((a, b) => b.durationMs - a.durationMs)
        .slice(0, 3);
      for (const entry of slowestForVisit) {
        const label = `${entry.page} #${visit.visitNumber}`;
        lines.push(`| ${label} | ${entry.method} | ${entry.path} | ${entry.status ?? 'network error'} | ${entry.durationMs} | ${entry.contentLengthBytes ?? 'n/a'} |`);
      }
    }
    lines.push('', '> Only Supabase fetch requests are counted here. Browser assets and the Meta SDK are visible in Eruda Network but are not included in these fetch totals. Content length is shown only when the response exposes that header; n/a is not zero.', '> No request query strings, headers, access tokens, bodies, response data, customer names, or customer messages are collected.');
    return lines.join('\n');
  };

  w.__abosPerfReport = report;
  w.__abosPerfCopy = async () => {
    const value = report();
    try {
      await navigator.clipboard.writeText(value);
      return 'ABOS A2 report copied. Paste it into this chat.';
    } catch {
      console.info(value);
      return 'Clipboard access was blocked; the report was printed in the Eruda console.';
    }
  };

  const script = document.createElement('script');
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.4.1/eruda.js';
  script.onload = () => {
    if (w.eruda) w.eruda.init();
    else console.warn('[ABOS A2] Eruda script loaded without its initializer.');
  };
  script.onerror = () => console.warn('[ABOS A2] Eruda could not load. Supabase timing remains available in the console.');
  document.head.appendChild(script);
}

export function setPerfPage(page: string): void {
  const state = getState();
  if (!state) return;
  const visitNumber = (state.visitCounts[page] ?? 0) + 1;
  state.visitCounts[page] = visitNumber;
  const visit: PerfVisit = {
    id: state.nextVisitId++,
    page,
    visitNumber,
    startedAt: performance.now(),
    readyMs: null,
  };
  state.current = visit;
  state.visits.push(visit);
  if (state.visits.length > 60) {
    const removed = state.visits.splice(0, state.visits.length - 60);
    const removedIds = new Set(removed.map((item) => item.id));
    state.requests = state.requests.filter((item) => !removedIds.has(item.visitId));
  }
}

export function getPerfContext(): PerfContext {
  const state = getState();
  if (!state?.current) return null;
  return { page: state.current.page, visitId: state.current.id };
}

export function recordPerfRequest(context: PerfContext, request: Omit<PerfRequest, 'page' | 'visitId'>): void {
  const state = getState();
  if (!state || !context) return;
  state.requests.push({ ...request, page: context.page, visitId: context.visitId });
  if (state.requests.length > 500) state.requests.splice(0, state.requests.length - 500);
  if (request.durationMs > 1500) {
    console.warn('[ABOS A2] SLOW', request.durationMs, request.method, request.path, request.status ?? 'network error');
  }
}

export function markPerfPageReady(page: string): void {
  const state = getState();
  const visit = state?.current;
  if (!state || !visit || visit.page !== page || visit.readyMs !== null) return;
  visit.readyMs = Math.round(performance.now() - visit.startedAt);
  const count = state.requests.filter((entry) => entry.visitId === visit.id).length;
  console.info('[ABOS A2] PAGE READY', page, `${visit.readyMs}ms`, `${count} Supabase requests`);
}
