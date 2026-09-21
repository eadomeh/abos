import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/types/database';
import {
  Activity,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  UserRound,
  XCircle,
} from 'lucide-react';

type AnalysisState = {
  detected_language?: string | null;
  current_intent?: string | null;
  urgency?: string | null;
  sales_stage?: string | null;
  next_best_action?: string | null;
  conversation_summary?: string | null;
  customer_signals?: Record<string, unknown> | null;
};

const STORAGE_PREFIX = 'abos_ai_agent_conversation_';
const quickPrompts = [
  'Yoo wassup 👋🏾',
  'Abeg wetin una get?',
  'How much be the black one?',
  'Can una deliver Abuja?',
];

export default function AgentPage() {
  const { activeBusiness } = useBusiness();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(
    () => (activeBusiness ? STORAGE_PREFIX + activeBusiness.id : null),
    [activeBusiness],
  );

  const loadSession = useCallback(async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const storedId = storageKey ? localStorage.getItem(storageKey) : null;
    if (!storedId) {
      setConversationId(null);
      setMessages([]);
      setAnalysis(null);
      setLoading(false);
      return;
    }

    const [{ data: conversation, error: conversationError }, { data: state }] =
      await Promise.all([
        supabase
          .from('conversations')
          .select('id')
          .eq('business_id', activeBusiness.id)
          .eq('id', storedId)
          .maybeSingle(),
        supabase
          .from('conversation_ai_state')
          .select('*')
          .eq('business_id', activeBusiness.id)
          .eq('conversation_id', storedId)
          .maybeSingle(),
      ]);

    if (conversationError || !conversation) {
      if (storageKey) localStorage.removeItem(storageKey);
      setConversationId(null);
      setMessages([]);
      setAnalysis(null);
      setLoading(false);
      return;
    }

    const { data: messageRows, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', storedId)
      .order('created_at', { ascending: true });

    setConversationId(storedId);
    setMessages((messageRows ?? []) as Message[]);
    setAnalysis((state ?? null) as AnalysisState | null);
    if (messagesError) setError(messagesError.message);
    setLoading(false);
  }, [activeBusiness, storageKey]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const createSession = async () => {
    if (!activeBusiness) return null;

    const { data, error: createError } = await supabase
      .from('conversations')
      .insert({
        business_id: activeBusiness.id,
        customer_name: 'AI Agent Workspace',
        customer_phone: null,
        channel: 'web',
        external_thread_id: 'agent-workspace-' + crypto.randomUUID(),
        unread_count: 0,
      })
      .select('id')
      .single();

    if (createError || !data) {
      setError(createError?.message ?? 'Could not create AI session.');
      return null;
    }

    setConversationId(data.id);
    if (storageKey) localStorage.setItem(storageKey, data.id);
    return data.id;
  };

  const startNewSession = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setConversationId(null);
    setMessages([]);
    setAnalysis(null);
    setDraft('');
    setError(null);
  };

  const sendMessage = async (event?: FormEvent, explicitText?: string) => {
    event?.preventDefault();
    if (!activeBusiness || sending) return;

    const content = (explicitText ?? draft).trim();
    if (!content) return;

    setSending(true);
    setDraft('');
    setError(null);

    try {
      const activeConversationId = conversationId ?? (await createSession());
      if (!activeConversationId) throw new Error('Could not start AI workspace.');

      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          business_id: activeBusiness.id,
          direction: 'incoming',
          content,
          channel: 'web',
          metadata: { source: 'ai_agent_ui' },
          status: 'sent',
        })
        .select('*')
        .single();

      if (saveError || !savedMessage) {
        throw new Error(saveError?.message ?? 'Could not save the message.');
      }

      setMessages((current) => [...current, savedMessage as Message]);

      const { data: result, error: aiError } = await supabase.functions.invoke(
        'abos-ai-agent',
        {
          body: {
            business_id: activeBusiness.id,
            conversation_id: activeConversationId,
            message_id: savedMessage.id,
            message: content,
            trigger: 'web',
          },
        },
      );

      if (aiError) throw aiError;
      if (!result?.ok) {
        throw new Error(result?.detail ?? result?.error ?? 'ABOS AI failed.');
      }

      const answer = String(result.answer ?? '').trim() || 'I’m ready. What do you need?';

      const { data: assistantMessage, error: assistantError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          business_id: activeBusiness.id,
          direction: 'outgoing',
          content: answer,
          channel: 'web',
          metadata: {
            source: 'abos_ai_agent',
            run_id: result.run_id ?? null,
            response_id: result.response_id ?? null,
            model: result.model ?? null,
          },
          status: 'sent',
        })
        .select('*')
        .single();

      if (assistantError || !assistantMessage) {
        throw new Error(assistantError?.message ?? 'AI responded, but the response could not be saved.');
      }

      setMessages((current) => [...current, assistantMessage as Message]);
      setAnalysis((result.analysis ?? null) as AnalysisState | null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'ABOS AI failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-4 py-4 md:px-8 md:py-6 border-b border-white/[0.06] flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 mb-1">AI OPERATING LAYER</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">ABOS AI Agent</h1>
                <p className="text-xs md:text-sm text-slate-500">Talk to the operating brain that will power WhatsApp and automations.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Core online
            </span>
            <button type="button" onClick={() => void loadSession()} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={startNewSession} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-200 hover:bg-white/[0.08]">
              <Plus className="w-4 h-4" />
              New session
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 p-4 md:p-6">
          <section className="glass rounded-2xl overflow-hidden flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Live Agent Workspace</span>
              </div>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">{conversationId ? 'session active' : 'new session'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="min-h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Meet your ABOS operating agent</h2>
                  <p className="text-sm text-slate-500 max-w-md mt-2">Test greetings, Pidgin, product questions, business knowledge and sales signals.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-xl">
                    {quickPrompts.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => void sendMessage(undefined, prompt)} className="text-left px-4 py-3 rounded-xl glass glass-hover text-sm text-slate-300 hover:text-white">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const outgoing = message.direction === 'outgoing';
                  return (
                    <div key={message.id} className={outgoing ? 'flex justify-end' : 'flex justify-start'}>
                      <div className="max-w-[88%] md:max-w-[78%] flex flex-col">
                        <div className={outgoing
                          ? 'px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                          : 'px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.07] text-slate-200'}>
                          <p className="text-sm leading-6 whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-700 mt-1 px-1">{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.07] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="text-sm text-slate-500">ABOS is thinking…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300 flex-1">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-white/[0.06] flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Talk to ABOS…"
                  className="flex-1 resize-none min-h-[46px] max-h-32 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
                <button type="submit" disabled={!draft.trim() || sending} className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-700 mt-2 px-1">Enter to send · Shift+Enter for a new line</p>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Live understanding</h2>
              </div>
              <div className="space-y-3">
                <InsightRow icon={MessageSquare} label="Intent" value={formatValue(analysis?.current_intent)} />
                <InsightRow icon={Target} label="Sales stage" value={formatValue(analysis?.sales_stage)} />
                <InsightRow icon={CircleDot} label="Urgency" value={formatValue(analysis?.urgency)} />
                <InsightRow icon={Sparkles} label="Language" value={formatValue(analysis?.detected_language)} />
                <InsightRow icon={Bot} label="Next action" value={formatValue(analysis?.next_best_action)} />
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserRound className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Signals</h2>
              </div>
              {analysis?.customer_signals && Object.keys(analysis.customer_signals).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.customer_signals).slice(0, 8).map(([key, value]) => (
                    <span key={key} className="px-2 py-1.5 rounded-lg bg-white/[0.04] text-[10px] text-slate-400">{key}: {String(value)}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">Signals will appear after ABOS analyzes a customer turn.</p>
              )}
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Session summary</h2>
              </div>
              <p className="text-xs text-slate-600 leading-5">{analysis?.conversation_summary ?? 'Send a message to create the first durable AI understanding record.'}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
      <div className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span>
            <span className="text-xs text-slate-300 text-right truncate max-w-[180px]">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatValue(value: string | null | undefined) {
  return value ? value.replace(/_/g, ' ') : '—';
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
