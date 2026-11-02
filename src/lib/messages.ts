import type { Message, MessageStatus } from '@/types/database';

/** A message as shown in a thread. Local-only fields describe bubbles the server has not confirmed. */
export type ChatMessage = Message & {
  /** True while the bubble exists only on this device (optimistic, or rejected before it was stored). */
  local?: boolean;
  /** For local failures: whether the Retry button may be offered. */
  retryable?: boolean;
};

/**
 * Delivery progress. failed shares rank 1 with sending so a retry can move a failed bubble
 * back to sending, while a late "sending" event can never downgrade sent, delivered or read.
 */
const STATUS_RANK: Record<MessageStatus, number> = {
  queued: 0,
  sending: 1,
  failed: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

export function statusRank(status: string | null | undefined): number {
  return status && status in STATUS_RANK ? STATUS_RANK[status as MessageStatus] : 0;
}

/**
 * authoritative: a live database change; the newest event wins (events arrive in order).
 * monotonic: a snapshot or a first-insert event, which may be older than what we already know;
 *            it can never move a message backwards (read -> sent, sent -> sending).
 */
export type MergeMode = 'authoritative' | 'monotonic';

const byTime = (a: ChatMessage, b: ChatMessage) => Date.parse(a.created_at) - Date.parse(b.created_at);

export function sameMessage(a: ChatMessage, b: ChatMessage): boolean {
  if (a.id === b.id) return true;
  return Boolean(a.client_id && b.client_id && a.client_id === b.client_id);
}

/** Stable React key: the client id survives the swap from optimistic bubble to server row. */
export function messageKey(message: ChatMessage): string {
  return message.client_id ?? message.id;
}

export function upsertMessage(list: ChatMessage[], incoming: ChatMessage, mode: MergeMode = 'authoritative'): ChatMessage[] {
  const index = list.findIndex((existing) => sameMessage(existing, incoming));

  if (index === -1) {
    const next = [...list, { ...incoming, local: false, retryable: undefined }];
    const previous = list[list.length - 1];
    if (previous && byTime(incoming, previous) < 0) next.sort(byTime);
    return next;
  }

  const existing = list[index];
  const keepExistingStatus = mode === 'monotonic' && statusRank(incoming.status) < statusRank(existing.status);
  const merged: ChatMessage = {
    ...existing,
    ...incoming,
    status: keepExistingStatus ? existing.status : incoming.status,
    error_code: keepExistingStatus ? existing.error_code : incoming.error_code,
    error_message: keepExistingStatus ? existing.error_message : incoming.error_message,
    local: false,
    retryable: undefined,
  };

  const next = list.slice();
  next[index] = merged;
  if (merged.created_at !== existing.created_at) next.sort(byTime);
  return next;
}

export function upsertMessages(list: ChatMessage[], incoming: ChatMessage[], mode: MergeMode = 'monotonic'): ChatMessage[] {
  return incoming.reduce((acc, message) => upsertMessage(acc, message, mode), list);
}

export function removeMessage(list: ChatMessage[], id: string): ChatMessage[] {
  return list.filter((message) => message.id !== id && message.client_id !== id);
}

/** Local patch (our own HTTP result or retry); matches the optimistic bubble by client id. */
export function patchMessage(list: ChatMessage[], clientId: string, patch: Partial<ChatMessage>): ChatMessage[] {
  return list.map((message) =>
    message.client_id === clientId || message.id === clientId ? { ...message, ...patch } : message,
  );
}

/** Fresh UUID for an outgoing message; the server uses it to make sending idempotent. */
export function newClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Our own successful HTTP result: moves the bubble to "sent" but never backwards. */
export function confirmSent(
  list: ChatMessage[],
  clientId: string,
  messageId: string | null,
  waMessageId: string | null,
): ChatMessage[] {
  return list.map((message) => {
    if (message.client_id !== clientId && message.id !== clientId) return message;
    if (statusRank(message.status) >= statusRank('sent')) return message;
    return {
      ...message,
      id: messageId ?? message.id,
      status: 'sent' as const,
      wa_message_id: waMessageId ?? message.wa_message_id,
      error_code: null,
      error_message: null,
      local: false,
      retryable: undefined,
    };
  });
}

export function createOptimisticMessage(input: {
  conversationId: string;
  businessId: string;
  content: string;
  clientId: string;
}): ChatMessage {
  return {
    id: input.clientId,
    client_id: input.clientId,
    conversation_id: input.conversationId,
    business_id: input.businessId,
    direction: 'outgoing',
    channel: 'whatsapp',
    content: input.content,
    status: 'sending',
    wa_message_id: null,
    error_code: null,
    error_message: null,
    metadata: {},
    created_at: new Date().toISOString(),
    local: true,
  };
}

const WINDOW_MS = 24 * 60 * 60 * 1000;
export type WindowState = 'open' | 'closed' | 'unknown';

/**
 * WhatsApp allows free-form replies only within 24 hours of the customer's last message.
 * The server enforces this; the UI uses it to explain why the composer is disabled.
 * Returns unknown when older, unloaded messages might still contain a recent customer message.
 */
export function serviceWindowState(messages: ChatMessage[], hasOlder: boolean, nowMs: number): WindowState {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].direction === 'incoming') {
      return nowMs - Date.parse(messages[i].created_at) <= WINDOW_MS ? 'open' : 'closed';
    }
  }
  return hasOlder ? 'unknown' : 'closed';
}

export type SendFailure = {
  kind: 'http' | 'network';
  status: number | null;
  code: string | null;
  message: string;
  messageId: string | null;
  /** Safe to show Retry (the same client id is reused, so the server will not send twice). */
  retryable: boolean;
  /** Another request for this message is already running; keep showing "sending". */
  keepSending: boolean;
};

type ErrorBody = { error?: unknown; code?: unknown; message_id?: unknown; details?: unknown };

/** Turns a supabase-js functions.invoke error into a clear, actionable failure. */
export async function readSendFailure(error: unknown): Promise<SendFailure> {
  const context = (error as { context?: unknown } | null)?.context as Response | undefined;
  const isHttp = Boolean(context && typeof context.status === 'number' && typeof context.clone === 'function');

  if (!context || !isHttp) {
    return {
      kind: 'network',
      status: null,
      code: null,
      message: 'No connection. This message is not confirmed as sent. Retry is safe and will not send it twice.',
      messageId: null,
      retryable: true,
      keepSending: false,
    };
  }

  let body: ErrorBody | null = null;
  try {
    body = (await context.clone().json()) as ErrorBody;
  } catch {
    body = null;
  }

  const status = context.status;
  const code = typeof body?.code === 'string' ? body.code : null;
  const messageId = typeof body?.message_id === 'string' ? body.message_id : null;
  const serverMessage = typeof body?.error === 'string' ? body.error : null;
  const details = typeof body?.details === 'string' ? body.details.slice(0, 140) : null;

  const make = (message: string, retryable: boolean, keepSending = false): SendFailure => ({
    kind: 'http', status, code, message, messageId, retryable, keepSending,
  });

  if (code === 'IN_PROGRESS' || code === 'DUPLICATE') return make('Still sending.', false, true);
  if (code === 'WINDOW_CLOSED') return make('The 24-hour WhatsApp window is closed. The customer must message you first.', false);
  if (code === 'ROLE_FORBIDDEN') return make('Your role cannot send messages.', false);
  if (code === 'NOT_CONNECTED') return make('WhatsApp is not connected. Connect it in Settings, then retry.', true);
  if (code === 'META_NETWORK') return make('Could not reach WhatsApp. Retry in a moment.', true);
  if (status === 401) return make('Your session expired. Reload the page and sign in again.', true);
  if (status === 404) return make('This conversation was not found.', false);
  if (status === 400 && !messageId) return make(serverMessage ?? 'This message could not be sent.', false);
  return make(details ? `WhatsApp could not send this: ${details}` : 'The message could not be sent. Retry.', true);
}
