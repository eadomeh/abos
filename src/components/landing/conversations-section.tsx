import { ArrowUp, CheckCheck, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { LIVE_THREADS, replyToAbos, type ChatMessage, type LiveThread } from "@/components/landing/chat-data";
import { PERSON, type PersonId } from "@/components/landing/people";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function ProductCard({ label, meta }: { label: string; meta: string }) {
  return (
    <div className="mb-2 overflow-hidden rounded-xl bg-black/25">
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold text-wa-text">{label}</p>
        <p className="text-xs text-signal/80">{meta}</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.05] px-3 py-2">
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
    </div>
  );
}

function lastPreview(thread: LiveThread): { text: string; time: string } {
  const last = thread.messages[thread.messages.length - 1];
  if (!last) return { text: PERSON[thread.id].preview, time: "" };
  return { text: last.text, time: last.time };
}

export function ConversationsSection() {
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile(1024);
  const [activeId, setActiveId] = useState<PersonId>("tunde");
  const [openThread, setOpenThread] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [shown, setShown] = useState(reduced ? 4 : 1);
  const [typing, setTyping] = useState(false);
  const [extra, setExtra] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const thread = useMemo(
    () => LIVE_THREADS.find((item) => item.id === activeId) ?? LIVE_THREADS[0]!,
    [activeId],
  );
  const person = PERSON[thread.id];
  const catalog = thread.messages;
  const visible = [...catalog.slice(0, Math.max(1, Math.min(shown, catalog.length))), ...extra];
  const showingThread = !mobile || openThread;

  useEffect(() => {
    if (reduced || pinned) return;
    if (mobile && !openThread) return;
    const id = window.setInterval(() => {
      setActiveId((current) => {
        const i = LIVE_THREADS.findIndex((item) => item.id === current);
        return LIVE_THREADS[(i + 1) % LIVE_THREADS.length]!.id;
      });
    }, 9000);
    return () => window.clearInterval(id);
  }, [reduced, pinned, mobile, openThread]);

  useEffect(() => {
    setExtra([]);
    setDraft("");
    if (reduced) {
      setShown(catalog.length);
      setTyping(false);
      return;
    }
    setShown(1);
    setTyping(false);
    let step = 1;
    const timers: number[] = [];
    const play = () => {
      if (step >= catalog.length) return;
      setTyping(true);
      timers.push(
        window.setTimeout(() => {
          step += 1;
          setShown(step);
          setTyping(false);
          if (step < catalog.length) {
            timers.push(window.setTimeout(play, 1100));
          }
        }, 900),
      );
    };
    timers.push(window.setTimeout(play, 900));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [activeId, catalog.length, reduced]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible.length, typing, showingThread]);

  function select(id: PersonId) {
    setActiveId(id);
    setPinned(true);
    setOpenThread(true);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setPinned(true);
    setOpenThread(true);
    setDraft("");
    const next: ChatMessage = { side: "customer", text: trimmed, time: "now" };
    setExtra((prev) => [...prev, next]);
    setTyping(true);
    const reply = replyToAbos(trimmed);
    window.setTimeout(() => {
      setExtra((prev) => [
        ...prev,
        {
          side: "abos",
          text: reply.text,
          time: "now",
        },
      ]);
      setTyping(false);
    }, 800);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    send(draft);
  }

  return (
    <section id="conversations" className="relative scroll-mt-20 overflow-hidden pb-28 pt-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs uppercase tracking-widest text-signal/80">Live chats</p>
        <h2 className="mt-4 max-w-xl font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
          One agent. Every open chat.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
          Each name has a face. ABOS stays in the thread, answers from the catalog, and keeps the next
          action attached to the customer — not to a generic chatbot.
        </p>

        <div className="mt-10 mb-24 flex h-[min(30.5rem,calc(100svh-16.5rem))] flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-charcoal lg:mb-0 lg:grid lg:h-[36rem] lg:grid-cols-[19.5rem_minmax(0,1fr)]">
          <aside
            className={cn(
              "min-h-0 flex-col border-white/8 lg:border-r",
              openThread ? "hidden lg:flex" : "flex flex-1",
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-quiet">Inbox</p>
              <span className="rounded-full bg-signal/10 px-2 py-0.5 text-[11px] text-signal">
                {LIVE_THREADS.length} live
              </span>
            </div>
            <div className="chip-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {LIVE_THREADS.map((item) => (
                <InboxRow
                  key={item.id}
                  thread={item}
                  active={item.id === activeId}
                  onSelect={() => select(item.id)}
                />
              ))}
            </div>
          </aside>

          <div
            className={cn(
              "min-h-0 flex-col bg-[#070d12]",
              openThread ? "flex flex-1 inbox-slide-in" : "hidden lg:flex",
            )}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-white/8 px-2 py-2.5 sm:px-4 sm:py-3">
              <button
                type="button"
                onClick={() => setOpenThread(false)}
                className="grid size-11 shrink-0 place-items-center rounded-full text-harmattan hover:bg-white/5 lg:hidden"
                aria-label="Back to inbox"
              >
                <ChevronLeft className="size-5" />
              </button>
              <img
                src={person.avatar}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold text-harmattan">
                  {person.name}
                  <span className="size-1.5 rounded-full bg-signal" />
                </p>
                <p className="truncate text-xs text-quiet">
                  {person.city}, {person.country} · {person.product}
                </p>
              </div>
            </div>

            <div ref={scroller} className="chip-scroll flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-y-auto px-3 py-4 sm:px-4">
              <p className="mx-auto rounded-full bg-black/25 px-3 py-1 text-[11px] uppercase tracking-widest text-quiet">
                ABOS is handling this conversation
              </p>
              {visible.map((message, index) => (
                <div
                  key={`${thread.id}-${index}-${message.text.slice(0, 12)}`}
                  className={cn("flex", message.side === "abos" ? "justify-end" : "justify-start")}
                >
                  {message.side === "customer" ? (
                    <img
                      src={person.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="mr-2 mt-1 size-7 shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-5 text-wa-text",
                      message.side === "customer" ? "rounded-tl-sm bg-wa-in" : "rounded-tr-sm bg-wa-out",
                    )}
                  >
                    {message.product ? <ProductCard label={thread.productLabel} meta={thread.productMeta} /> : null}
                    <p>{message.text}</p>
                    <p
                      className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[11px]",
                        message.side === "abos" ? "text-signal/70" : "text-wa-meta",
                      )}
                    >
                      {message.time}
                      {message.side === "abos" ? <CheckCheck className="size-3" /> : null}
                    </p>
                  </div>
                </div>
              ))}
              {typing ? (
                <div className="flex justify-end">
                  <TypingDots />
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-white/8 px-3 pb-3 pt-2 sm:px-4">
              <div className="chip-scroll mb-2 flex gap-2 overflow-x-auto">
                {thread.suggestions.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => send(hint)}
                    className="h-9 shrink-0 snap-start rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-harmattan-muted hover:border-signal/30 hover:text-signal"
                  >
                    {hint}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message as ${person.name}`}
                  className="h-11 min-w-0 flex-1 rounded-full bg-[#2a3942] px-4 text-sm text-harmattan outline-none ring-1 ring-transparent placeholder:text-quiet focus:ring-signal/40"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || typing}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-primary-foreground disabled:opacity-40"
                  aria-label="Send message"
                >
                  <ArrowUp className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InboxRow({
  thread,
  active,
  onSelect,
}: {
  thread: LiveThread;
  active: boolean;
  onSelect: () => void;
}) {
  const person = PERSON[thread.id];
  const preview = lastPreview(thread);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-[background-color] duration-150",
        active ? "bg-signal/10 ring-1 ring-signal/20" : "hover:bg-white/[0.04]",
      )}
    >
      <span className="relative shrink-0">
        <img
          src={person.avatar}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full object-cover ring-1 ring-white/10"
        />
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-signal ring-2 ring-charcoal" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-harmattan">{person.name}</span>
          <span className="shrink-0 text-[11px] text-quiet">{preview.time}</span>
        </span>
        <span className="mt-0.5 line-clamp-1 text-xs leading-5 text-quiet">{preview.text}</span>
      </span>
    </button>
  );
}
