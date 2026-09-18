import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Conversation, Message, Customer } from '@/types/database';
import {
  MessageCircle, Search, Send, Plus, X, Loader2, AlertCircle,
  Phone, ArrowLeft, CheckCheck, User, Users, Check, AlertTriangle,
} from 'lucide-react';

export default function ConversationsPage() {
  const { activeBusiness } = useBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!activeBusiness) { setLoadingConvos(false); return; }
    setLoadingConvos(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', activeBusiness.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (!error && data) {
      setConversations(data as Conversation[]);
    }
    setLoadingConvos(false);
  }, [activeBusiness]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
    setLoadingMsgs(false);
  }, [selectedId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription for conversations
  useEffect(() => {
    if (!activeBusiness) return;
    const channel = supabase
      .channel('conversations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `business_id=eq.${activeBusiness.id}` },
        () => { fetchConversations(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeBusiness, fetchConversations]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (!selectedId) return;
    const convo = conversations.find((c) => c.id === selectedId);
    if (convo && convo.unread_count > 0) {
      supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', selectedId)
        .then(() => {
          setConversations((prev) => prev.map((c) => c.id === selectedId ? { ...c, unread_count: 0 } : c));
        });
    }
  }, [selectedId, conversations]);

  // Send message via WhatsApp edge function
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !selectedId || !activeBusiness) return;
    setSending(true);
    const content = draft.trim();
    setDraft('');

    try {
      const { data: result, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { conversationId: selectedId, content },
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error ?? 'Failed to send message');

      fetchConversations();
    } catch {
      // Fallback: save as a local message with failed status so the user sees it
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        conversation_id: selectedId,
        business_id: activeBusiness.id,
        direction: 'outgoing',
        content,
        wa_message_id: null,
        status: 'failed',
        error_code: null,
        error_message: 'Could not send via WhatsApp',
        created_at: new Date().toISOString(),
      } as Message]);
    }
    setSending(false);
  };

  // Filter conversations by search
  const filteredConvos = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.customer_name.toLowerCase().includes(q) || (c.customer_phone ?? '').includes(q);
  });

  const selectedConvo = conversations.find((c) => c.id === selectedId) ?? null;

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
          {filteredConvos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">
                {search ? 'No matches found' : 'No conversations yet'}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs">
                {search ? 'Try a different search term.' : 'Start a new conversation to chat with a customer.'}
              </p>
            </div>
          ) : (
            filteredConvos.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedId(convo.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.03] transition-all text-left ${
                  selectedId === convo.id ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  {convo.customer_name[0]?.toUpperCase() ?? '?'}
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
                onClick={() => setSelectedId(null)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white">
                {selectedConvo.customer_name[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{selectedConvo.customer_name}</h3>
                {selectedConvo.customer_phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedConvo.customer_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">No messages yet. Send the first message below.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOutgoing = msg.direction === 'outgoing';
                  const prevMsg = messages[i - 1];
                  const showDate = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[10px] text-slate-600 px-3 py-1 rounded-full glass">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          isOutgoing
                            ? msg.status === 'failed'
                              ? 'bg-red-500/10 border border-red-500/20 text-slate-200 rounded-br-md'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md'
                            : 'glass text-slate-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] ${isOutgoing ? (msg.status === 'failed' ? 'text-red-400' : 'text-emerald-100/70') : 'text-slate-600'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                            {isOutgoing && msg.status === 'failed' ? (
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            ) : isOutgoing && msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-blue-300" />
                            ) : isOutgoing && msg.status === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 text-emerald-100/70" />
                            ) : isOutgoing && (
                              <Check className="w-3 h-3 text-emerald-100/70" />
                            )}
                          </div>
                          {isOutgoing && msg.status === 'failed' && msg.error_message && (
                            <p className="text-[10px] text-red-400 mt-1">{msg.error_message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 flex items-center justify-center text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
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
            fetchConversations();
            setSelectedId(convoId);
          }}
        />
      )}
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
