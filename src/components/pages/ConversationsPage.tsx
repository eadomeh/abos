import { useState, useEffect, useCallback, useRef, useLayoutEffect, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Conversation, Customer } from '@/types/database';
import { getInitial } from '@/lib/avatar';
import { markPerfPageReady } from '@/lib/perf-debug';
import {
  type ChatMessage,
  confirmSent,
  createOptimisticMessage,
  messageKey,
  newClientId,
  patchMessage,
  readSendFailure,
  removeMessage,
  serviceWindowState,
  upsertMessage,
  upsertMessages,
} from '@/lib/messages';
import {
  MessageCircle, Search, Send, Plus, X, Loader2, AlertCircle,
  Phone, ArrowLeft, CheckCheck, User, Users, Check, AlertTriangle,
  ShoppingCart, CircleDollarSign, Target, ClipboardList, ExternalLink,
  Clock, RotateCw, ChevronDown, ArrowDown,
} from 'lucide-react';

type CustomerContext = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  activeLeadCount: number;
  openTaskCount: number;
};

const PAGE_SIZE = 50;
const SEND_ROLES = ['owner', 'admin', 'agent'];
const STUCK_SENDING_MS = 90_000;

const timeValue = (iso: string | null) => (iso ? Date.parse(iso) : Number.NEGATIVE_INFINITY);

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => timeValue(b.last_message_at) - timeValue(a.last_message_at));
}

export default function ConversationsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id ?? null;
  const canSend = activeBusiness ? SEND_ROLES.includes(activeBusiness.role) : false;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [convoError, setConvoError] = useState<string | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);
  const [loadingCustomerContext, setLoadingCustomerContext] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [newBelow, setNewBelow] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stickRef = useRef(true);
  const selectedIdRef = useRef<string | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());
  const lastKeyRef = useRef<string | null>(null);
  const prependRef = useRef<{ prevHeight: number; prevTop: number } | null>(null);

  // First load (and business switch): the only time the inbox shows a full-screen spinner.
  const fetchConversations = useCallback(async () => {
    if (!businessId) { setLoadingConvos(false); return; }
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', businessId)
      .eq('kind', 'customer')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error || !data) {
      setConvoError('Could not load conversations. Check your connection and try again.');
    } else {
      setConvoError(null);
      setConversations(data as Conversation[]);
    }
    setLoadingConvos(false);
  }, [businessId]);

  // Quiet refresh after a dropped connection or when the app returns to the foreground.
  // It merges into what is on screen and never clears or reloads it.
  const resync = useCallback(async () => {
    if (!businessId) return;
    const threadId = selectedIdRef.current;
    const [convoRes, msgRes] = await Promise.all([
      supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .eq('kind', 'customer')
        .order('last_message_at', { ascending: false, nullsFirst: false }),
      threadId
        ? supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', threadId)
            .order('created_at', { ascending: false })
            .limit(PAGE_SIZE)
        : Promise.resolve(null),
    ]);

    if (!convoRes.error && convoRes.data) setConversations(convoRes.data as Conversation[]);
    if (threadId && selectedIdRef.current === threadId && msgRes && !msgRes.error && msgRes.data) {
      const rows = [...(msgRes.data as ChatMessage[])].reverse();
      setMessages((current) => upsertMessages(current, rows, 'monotonic'));
    }
  }, [businessId]);

  useEffect(() => {
    setConversations([]);
    setSelectedId(null);
    setMessages([]);
    setConvoError(null);
    setLoadingConvos(true);
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!loadingConvos) markPerfPageReady('conversations');
  }, [loadingConvos]);

  // Load the newest page of messages when a conversation is opened.
  useEffect(() => {
    selectedIdRef.current = selectedId;
    setMessages([]);
    setHasOlder(false);
    setMsgError(null);
    setNewBelow(0);
    setContextOpen(false);
    stickRef.current = true;
    lastKeyRef.current = null;
    prependRef.current = null;

    if (!selectedId) { setLoadingMsgs(false); return; }

    let cancelled = false;
    setLoadingMsgs(true);

    void (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (cancelled) return;
      if (error || !data) {
        setMsgError('Could not load messages. Check your connection and try again.');
      } else {
        const rows = [...(data as ChatMessage[])].reverse();
        setMessages((current) => upsertMessages(current, rows, 'monotonic'));
        setHasOlder(data.length === PAGE_SIZE);
      }
      setLoadingMsgs(false);
    })();

    return () => { cancelled = true; };
  }, [selectedId]);

  // Realtime: conversation list. Changes are merged into the list, never refetched.
  useEffect(() => {
    if (!businessId) return;
    let subscribedBefore = false;
    const channel = supabase
      .channel(`inbox-conversations:${businessId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `business_id=eq.${businessId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) setConversations((current) => current.filter((c) => c.id !== removedId));
            return;
          }
          const row = payload.new as Conversation;
          if (row.kind !== 'customer') return;
          setConversations((current) =>
            sortConversations(
              current.some((c) => c.id === row.id)
                ? current.map((c) => (c.id === row.id ? { ...c, ...row } : c))
                : [...current, row],
            ),
          );
        },
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        if (subscribedBefore) void resync();
        subscribedBefore = true;
      });

    return () => { void supabase.removeChannel(channel); };
  }, [businessId, resync]);

  // Realtime: messages of the open conversation. Merge by client id / id; never replace the list.
  useEffect(() => {
    if (!selectedId) return;
    let subscribedBefore = false;
    const channel = supabase
      .channel(`thread-messages:${selectedId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) setMessages((current) => removeMessage(current, removedId));
            return;
          }
          const row = payload.new as ChatMessage;
          // A first INSERT can be older than what we already know; later UPDATEs are authoritative.
          setMessages((current) => upsertMessage(current, row, payload.eventType === 'INSERT' ? 'monotonic' : 'authoritative'));
        },
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        if (subscribedBefore) void resync();
        subscribedBefore = true;
      });

    return () => { void supabase.removeChannel(channel); };
  }, [selectedId, resync]);

  // Returning to the app or regaining the network: quiet resync (at most once every 3 seconds).
  useEffect(() => {
    let last = 0;
    const run = () => {
      const now = Date.now();
      if (now - last < 3000) return;
      last = now;
      void resync();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', run);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', run);
    };
  }, [resync]);

  // Keeps the 24-hour window and "still sending" hints current.
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Mark the open conversation as read.
  const selectedUnread = conversations.find((c) => c.id === selectedId)?.unread_count ?? 0;
  useEffect(() => {
    if (!selectedId || selectedUnread <= 0) return;
    void supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', selectedId)
      .then(({ error }) => {
        if (!error) {
          setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c)));
        }
      });
  }, [selectedId, selectedUnread]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (stickRef.current) setNewBelow(0);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stickRef.current = true;
    setNewBelow(0);
  };

  // Scrolling rules: status changes never move the thread; new messages follow only if you are
  // already at the bottom (otherwise a "new messages" button appears); loading older messages
  // keeps your place.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const last = messages[messages.length - 1];
    const lastKey = last ? messageKey(last) : null;

    if (prependRef.current) {
      if (el) el.scrollTop = el.scrollHeight - prependRef.current.prevHeight + prependRef.current.prevTop;
      prependRef.current = null;
      lastKeyRef.current = lastKey;
      return;
    }

    const changed = lastKey !== lastKeyRef.current;
    const firstLoad = lastKeyRef.current === null && lastKey !== null;
    lastKeyRef.current = lastKey;
    if (!el || !changed || !last) return;

    const sentByMe = last.direction === 'outgoing' && last.local === true;
    if (firstLoad || stickRef.current || sentByMe) {
      el.scrollTop = el.scrollHeight;
      stickRef.current = true;
    } else if (last.direction === 'incoming') {
      setNewBelow((count) => count + 1);
    }
  }, [messages]);

  const loadOlder = async () => {
    const threadId = selectedId;
    const oldest = messages.find((m) => !m.local);
    if (!threadId || !oldest || loadingOlder) return;
    setLoadingOlder(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', threadId)
      .lt('created_at', oldest.created_at)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (selectedIdRef.current === threadId) {
      if (error || !data) {
        setMsgError('Could not load earlier messages.');
      } else {
        const rows = [...(data as ChatMessage[])].reverse();
        const el = scrollRef.current;
        if (el && rows.length > 0) prependRef.current = { prevHeight: el.scrollHeight, prevTop: el.scrollTop };
        setMessages((current) => upsertMessages(current, rows, 'monotonic'));
        setHasOlder(data.length === PAGE_SIZE);
      }
    }
    setLoadingOlder(false);
  };

  // Sends through the WhatsApp edge function. The same client id is reused for every retry,
  // so the server can never send one bubble twice.
  const deliver = useCallback(async (conversationId: string, content: string, clientId: string) => {
    if (inFlightRef.current.has(clientId)) return;
    inFlightRef.current.add(clientId);
    const apply = (change: (list: ChatMessage[]) => ChatMessage[]) => {
      if (selectedIdRef.current === conversationId) setMessages(change);
    };

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { conversationId, content, clientId },
      });

      if (error) {
        const failure = await readSendFailure(error);
        if (failure.keepSending) return;
        apply((list) => patchMessage(list, clientId, {
          status: 'failed',
          error_code: failure.code,
          error_message: failure.message,
          retryable: failure.retryable,
        }));
        return;
      }

      const result = data as { success?: boolean; message_id?: string; wa_message_id?: string | null } | null;
      if (!result?.success) {
        apply((list) => patchMessage(list, clientId, {
          status: 'failed',
          error_message: 'The message could not be sent. Retry.',
          retryable: true,
        }));
        return;
      }
      apply((list) => confirmSent(list, clientId, result.message_id ?? null, result.wa_message_id ?? null));
    } catch {
      const failure = await readSendFailure(null);
      apply((list) => patchMessage(list, clientId, {
        status: 'failed',
        error_message: failure.message,
        retryable: true,
      }));
    } finally {
      inFlightRef.current.delete(clientId);
    }
  }, []);

  const windowState = loadingMsgs ? 'unknown' : serviceWindowState(messages, hasOlder, nowMs);
  const composerLocked = !canSend || windowState === 'closed';

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !selectedId || !businessId || composerLocked) return;
    if (content.length > 4096) {
      setMsgError('Messages are limited to 4096 characters.');
      return;
    }

    const clientId = newClientId();
    setMessages((current) => [
      ...current,
      createOptimisticMessage({ conversationId: selectedId, businessId, content, clientId }),
    ]);
    setDraft('');
    setMsgError(null);
    stickRef.current = true;
    void deliver(selectedId, content, clientId);
    inputRef.current?.focus();
  };

  const retrySend = (message: ChatMessage) => {
    if (!selectedId || !message.client_id || !canSend) return;
    const clientId = message.client_id;
    setMessages((current) => patchMessage(current, clientId, {
      status: 'sending',
      error_code: null,
      error_message: null,
      retryable: undefined,
    }));
    void deliver(selectedId, message.content, clientId);
  };

  const dismissMessage = (message: ChatMessage) => {
    setMessages((current) => removeMessage(current, message.client_id ?? message.id));
  };

  // Filter conversations by search
  const filteredConvos = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.customer_name.toLowerCase().includes(q) || (c.customer_phone ?? '').includes(q);
  });

  const selectedConvo = conversations.find((c) => c.id === selectedId) ?? null;
  useEffect(() => {
    if (!selectedConvo?.customer_id || !businessId) {
      setCustomerContext(null);
      setLoadingCustomerContext(false);
      return;
    }

    let cancelled = false;

    const loadCustomerContext = async () => {
      setLoadingCustomerContext(true);

      const [customerRes, ordersRes, leadsRes, tasksRes] = await Promise.all([
        supabase
          .from('customers')
          .select('id,name,phone,email')
          .eq('id', selectedConvo.customer_id)
          .eq('business_id', businessId)
          .maybeSingle(),

        supabase
          .from('orders')
          .select('total_amount,status')
          .eq('business_id', businessId)
          .eq('customer_id', selectedConvo.customer_id),

        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('customer_id', selectedConvo.customer_id)
          .not('status', 'in', '(won,lost)'),

        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('related_customer_id', selectedConvo.customer_id)
          .neq('status', 'done'),
      ]);

      if (cancelled) return;

      if (customerRes.data) {
        const completedOrders = (ordersRes.data ?? []).filter(
          (order) => order.status === 'completed'
        );

        setCustomerContext({
          id: customerRes.data.id,
          name: customerRes.data.name,
          phone: customerRes.data.phone,
          email: customerRes.data.email,
          orderCount: completedOrders.length,
          totalSpent: completedOrders.reduce(
            (sum, order) => sum + Number(order.total_amount ?? 0),
            0
          ),
          activeLeadCount: leadsRes.count ?? 0,
          openTaskCount: tasksRes.count ?? 0,
        });
      } else {
        setCustomerContext(null);
      }

      setLoadingCustomerContext(false);
    };

    void loadCustomerContext();

    return () => {
      cancelled = true;
    };
  }, [businessId, selectedConvo?.customer_id]);


  if (loadingConvos) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversation list */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-white/[0.06] flex-shrink-0`}>
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-bold text-white">Conversations</h1>
            </div>
            <button
              type="button"
              aria-label="New conversation"
              onClick={() => setShowNew(true)}
              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convoError && (
            <div className="m-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 flex-1">{convoError}</p>
              <button
                type="button"
                onClick={() => { setLoadingConvos(true); void fetchConversations(); }}
                className="text-xs font-medium text-red-200 underline"
              >
                Retry
              </button>
            </div>
          )}
          {filteredConvos.length === 0 && !convoError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">
                {search ? 'No matches found' : 'No customer conversations yet'}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs">
                {search
                  ? 'Try a different search term.'
                  : 'Customer chats appear here when they message your connected WhatsApp number. You can also start one with the plus button.'}
              </p>
            </div>
          ) : (
            filteredConvos.map((convo) => (
              <button
                key={convo.id}
                type="button"
                onClick={() => setSelectedId(convo.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.03] transition-all text-left ${
                  selectedId === convo.id ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  {getInitial(convo.customer_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white truncate">{convo.customer_name}</span>
                    {convo.last_message_at && (
                      <span className="text-[10px] text-slate-600 flex-shrink-0">
                        {formatTime(convo.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-slate-500 truncate flex-1">
                      {convo.last_message_preview ?? 'No messages yet'}
                    </p>
                    {convo.unread_count > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat thread */}
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
        {selectedConvo ? (
          <>
            {/* Chat header */}
            <div className="h-16 border-b border-white/[0.06] flex items-center px-4 gap-3 flex-shrink-0">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={() => setSelectedId(null)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white">
                {getInitial(selectedConvo.customer_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {customerContext?.name ?? selectedConvo.customer_name}
                </h3>
                {(customerContext?.phone ?? selectedConvo.customer_phone) && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {customerContext?.phone ?? selectedConvo.customer_phone}
                  </p>
                )}
              </div>

              {onNavigate && customerContext && (
                <button
                  type="button"
                  onClick={() => onNavigate('customers')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Customer
                </button>
              )}
            </div>

            <CustomerContextCard
              context={customerContext}
              loading={loadingCustomerContext}
              open={contextOpen}
              onToggle={() => setContextOpen((value) => !value)}
            />

            {/* Messages */}
            <div className="relative flex-1 min-h-0">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4 space-y-3"
              >
                {hasOlder && !loadingMsgs && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => void loadOlder()}
                      disabled={loadingOlder}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-slate-300 hover:text-white disabled:opacity-60"
                    >
                      {loadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Load earlier messages
                    </button>
                  </div>
                )}
                {loadingMsgs && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-3">
                      <MessageCircle className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">
                      {canSend ? 'No messages yet. Send the first message below.' : 'No messages yet.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <MessageBubble
                      key={messageKey(msg)}
                      message={msg}
                      showDate={i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)}
                      nowMs={nowMs}
                      canRetry={canSend}
                      onRetry={retrySend}
                      onDismiss={dismissMessage}
                    />
                  ))
                )}
              </div>
              {newBelow > 0 && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium shadow-lg"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  New messages
                </button>
              )}
            </div>

            {msgError && (
              <div className="mx-4 mb-2 flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-300 flex-1">{msgError}</p>
                <button type="button" aria-label="Dismiss error" onClick={() => setMsgError(null)} className="text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message input */}
            {!canSend ? (
              <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
                <p className="text-xs text-slate-500 text-center">
                  Your role can read conversations but cannot send messages.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-4 border-t border-white/[0.06] flex-shrink-0">
                {windowState === 'closed' && (
                  <p className="text-xs text-amber-300/90 mb-2">
                    The 24-hour WhatsApp window is closed. You can reply again after this customer messages you.
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={4096}
                    disabled={windowState === 'closed'}
                    enterKeyHint="send"
                    autoComplete="off"
                    placeholder={windowState === 'closed' ? 'Window closed' : 'Type a message...'}
                    className="flex-1 min-w-0 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-base focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={!draft.trim() || composerLocked}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 flex items-center justify-center text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Select a Conversation</h3>
            <p className="text-sm text-slate-600 max-w-sm">
              Choose a conversation from the list to view messages, or start a new one with the plus button.
            </p>
          </div>
        )}
      </div>

      {/* New conversation modal */}
      {showNew && activeBusiness && (
        <NewConversationModal
          businessId={activeBusiness.id}
          onClose={() => setShowNew(false)}
          onCreated={(convoId) => {
            setShowNew(false);
            void resync();
            setSelectedId(convoId);
          }}
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  showDate,
  nowMs,
  canRetry,
  onRetry,
  onDismiss,
}: {
  message: ChatMessage;
  showDate: boolean;
  nowMs: number;
  canRetry: boolean;
  onRetry: (message: ChatMessage) => void;
  onDismiss: (message: ChatMessage) => void;
}) {
  const isOutgoing = message.direction === 'outgoing';
  const failed = isOutgoing && message.status === 'failed';
  const pending = isOutgoing && (message.status === 'sending' || message.status === 'queued');
  const stuck = pending && nowMs - Date.parse(message.created_at) > STUCK_SENDING_MS;
  const retryAllowed = failed && canRetry && Boolean(message.client_id) && message.retryable !== false;
  const dismissAllowed = failed && message.local === true && message.retryable === false;

  return (
    <div>
      {showDate && (
        <div className="flex items-center justify-center my-4">
          <span className="text-[10px] text-slate-600 px-3 py-1 rounded-full glass">
            {formatDate(message.created_at)}
          </span>
        </div>
      )}
      <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          isOutgoing
            ? failed
              ? 'bg-red-500/10 border border-red-500/20 text-slate-200 rounded-br-md'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md'
            : 'glass text-slate-200 rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`flex items-center gap-1 mt-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isOutgoing ? (failed ? 'text-red-400' : 'text-emerald-100/70') : 'text-slate-600'}`}>
              {formatTime(message.created_at)}
            </span>
            {isOutgoing && (
              failed ? (
                <AlertTriangle className="w-3 h-3 text-red-400" aria-label="Failed to send" />
              ) : message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-blue-300" aria-label="Read" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3 h-3 text-emerald-100/70" aria-label="Delivered" />
              ) : message.status === 'sent' ? (
                <Check className="w-3 h-3 text-emerald-100/70" aria-label="Sent" />
              ) : (
                <Clock className="w-3 h-3 text-emerald-100/70" aria-label="Sending" />
              )
            )}
          </div>
          {failed && message.error_message && (
            <p className="text-[11px] text-red-300 mt-1">{message.error_message}</p>
          )}
          {stuck && (
            <p className="text-[11px] text-emerald-50/80 mt-1">
              No confirmation yet. Check WhatsApp before sending this again.
            </p>
          )}
          {(retryAllowed || dismissAllowed) && (
            <div className="flex items-center justify-end gap-3 mt-1.5">
              {retryAllowed && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-red-200 underline"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry
                </button>
              )}
              {dismissAllowed && (
                <button
                  type="button"
                  onClick={() => onDismiss(message)}
                  className="text-[11px] font-medium text-slate-300 underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerContextCard({
  context,
  loading,
  open,
  onToggle,
}: {
  context: CustomerContext | null;
  loading: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  if (loading) {
    return (
      <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading customer context...
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.01]">
        <p className="text-xs text-slate-600">No linked customer context.</p>
      </div>
    );
  }

  return (
    <div className="border-b border-white/[0.06] bg-white/[0.01]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-2 text-left"
      >
        <span className="min-w-0 text-xs text-slate-400 truncate">
          <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-400 mr-2">Customer context</span>
          {context.orderCount} {context.orderCount === 1 ? 'order' : 'orders'} · NGN {context.totalSpent.toLocaleString()}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-500 mb-2.5">
            {context.email ?? context.phone ?? 'Linked customer'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ContextMetric icon={ShoppingCart} label="Orders" value={String(context.orderCount)} />
            <ContextMetric
              icon={CircleDollarSign}
              label="Spent"
              value={`NGN ${context.totalSpent.toLocaleString()}`}
            />
            <ContextMetric icon={Target} label="Leads" value={String(context.activeLeadCount)} />
            <ContextMetric icon={ClipboardList} label="Tasks" value={String(context.openTaskCount)} />
          </div>
        </div>
      )}
    </div>
  );
}

function ContextMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-2.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[9px] uppercase tracking-wider text-slate-600">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white mt-1 truncate">{value}</p>
    </div>
  );
}

function NewConversationModal({ businessId, onClose, onCreated }: {
  businessId: string;
  onClose: () => void;
  onCreated: (convoId: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [linkedCustomer, setLinkedCustomer] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setCustomers(data as Customer[]);
      });
  }, [businessId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Customer name is required'); return; }
    setError(null);
    setLoading(true);

    // Check if conversation already exists with this phone
    if (phone.trim()) {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('business_id', businessId)
        .eq('customer_phone', phone.trim())
        .maybeSingle();

      if (existing) {
        setError('A conversation with this phone number already exists.');
        setLoading(false);
        return;
      }
    }

    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .insert({
        business_id: businessId,
        customer_id: linkedCustomer ?? null,
        customer_name: name.trim(),
        customer_phone: phone.trim() || null,
        channel: 'whatsapp',
        last_message_preview: firstMessage.trim() || null,
        last_message_at: firstMessage.trim() ? new Date().toISOString() : null,
      })
      .select()
      .maybeSingle();

    if (convoError || !convo) {
      setError('Could not create conversation. Please try again.');
      setLoading(false);
      return;
    }

    // Send first message via WhatsApp if provided
    if (firstMessage.trim()) {
      try {
        await supabase.functions.invoke('whatsapp-send', {
          body: { conversationId: convo.id, content: firstMessage.trim() },
        });
      } catch {
        // If WhatsApp send fails, still create the conversation; the owner can retry from the thread.
      }
    }

    setLoading(false);
    onCreated(convo.id);
  };

  const linkCustomer = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setLinkedCustomer(customerId);
      setName(cust.name);
      setPhone(cust.phone ?? '');
    } else {
      setLinkedCustomer(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-white">New Conversation</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {customers.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowLink(!showLink)}
                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                {showLink ? 'Hide customer list' : 'Link to existing customer'}
              </button>
              {showLink && (
                <select
                  value={linkedCustomer ?? ''}
                  onChange={(e) => linkCustomer(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0B141A]">Select a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0B141A]">{c.name} {c.phone ? `— ${c.phone}` : ''}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              <User className="w-3 h-3" /> Customer Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chidi Okafor"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              First Message <span className="text-slate-600 normal-case tracking-normal">— optional</span>
            </label>
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Type an opening message..."
              rows={2}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageCircle className="w-4 h-4" /> Start Conversation</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(iso, now.toISOString())) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 7) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(iso, now.toISOString())) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(iso, yesterday.toISOString())) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
