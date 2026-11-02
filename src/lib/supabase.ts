import { createClient } from '@supabase/supabase-js';
import { getPerfContext, isPerfDebugEnabled, recordPerfRequest } from '@/lib/perf-debug';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY
) as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const isEmailVerificationCallback = typeof window === 'undefined' ? false : new URLSearchParams(window.location.search).get('auth_callback') === 'email-confirmation';
const timedFetch: typeof fetch = async (input, init) => {
  const context = getPerfContext();
  const startedAt = performance.now();
  const rawUrl = typeof Request !== 'undefined' && input instanceof Request
    ? input.url
    : input instanceof URL ? input.href : input.toString();
  const method = init?.method ?? (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET');
  let safePath = '/unknown';
  try {
    safePath = new URL(rawUrl, supabaseUrl).pathname
      .split('/')
      .map((part) => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part) || /^\d{5,}$/.test(part) ? ':id' : part)
      .join('/');
  } catch {
    // Never retain the original URL when it cannot be parsed.
  }

  try {
    const response = await fetch(input, init);
    const durationMs = Math.round(performance.now() - startedAt);
    const rawLength = response.headers.get('content-length');
    const parsedLength = rawLength === null ? Number.NaN : Number(rawLength);
    recordPerfRequest(context, {
      method: method.toUpperCase(),
      path: safePath,
      status: response.status,
      durationMs,
      contentLengthBytes: Number.isFinite(parsedLength) && parsedLength >= 0 ? parsedLength : null,
    });
    return response;
  } catch (error) {
    recordPerfRequest(context, {
      method: method.toUpperCase(),
      path: safePath,
      status: null,
      durationMs: Math.round(performance.now() - startedAt),
      contentLengthBytes: null,
    });
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: isPerfDebugEnabled ? { fetch: timedFetch } : undefined,
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
