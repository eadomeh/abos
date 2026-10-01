import { CheckCheck, ChevronRight, MapPin, MoreHorizontal, Package, Phone, Search, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LIVE_THREADS, type ChatMessage } from "@/components/landing/chat-data";
import { PERSON } from "@/components/landing/people";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const DEMO_THREADS = LIVE_THREADS.slice(0, 5);

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tr-sm bg-wa-out/40 px-3 py-2">
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
    </div>
  );
}

function ProductCard({ label, meta }: { label: string; meta: string }) {
  return (
    <div className="mb-2 overflow-hidden rounded-xl bg-black/20">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="grid size-9 place-items-center rounded-lg bg-signal/15 text-signal">
          <Package className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-wa-text">{label}</p>
          <p className="text-xs text-signal/80">{meta}</p>
        </div>
      </div>
    </div>
  );
}

export function WhatsappThread() {
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [threadIndex, setThreadIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(true);
  const [shown, setShown] = useState(reduced ? 4 : 1);
  const [typing, setTyping] = useState(false);
  const [lead, setLead] = useState(reduced);
  const [extra, setExtra] = useState<ChatMessage[]>([]);

  const thread = DEMO_THREADS[threadIndex] ?? DEMO_THREADS[0]!;
  const person = PERSON[thread.id];
  const catalog = thread.messages;
  const visible = useMemo(
    () => [...catalog.slice(0, Math.max(1, Math.min(shown, catalog.length))), ...extra],
    [catalog, shown, extra],
  );

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.12 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setExtra([]);
    if (reduced) {
      setShown(catalog.length);
      setTyping(false);
      setLead(true);
      return;
    }
    setShown(1);
    setTyping(false);
    setLead(false);
    if (!playing || !inView) return;

    let step = 1;
    const timers: number[] = [];
    const play = () => {
      if (step >= catalog.length) {
        timers.push(
          window.setTimeout(() => {
            setLead(true);
            timers.push(
              window.setTimeout(() => {
                setThreadIndex((i) => (i + 1) % DEMO_THREADS.length);
              }, 2600),
            );
          }, 700),
        );
        return;
      }
      setTyping(true);
      timers.push(
        window.setTimeout(() => {
          step += 1;
          setShown(step);
          setTyping(false);
          timers.push(window.setTimeout(play, 900));
        }, 850),
      );
    };
    timers.push(window.setTimeout(play, 800));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced, playing, inView, catalog.length, threadIndex]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible.length, typing, lead]);

  function sendSuggestion(text: string) {
    setPlaying(false);
    setLead(false);
    setExtra((prev) => [...prev, { side: "customer", text, time: "now" }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setExtra((prev) => [
        ...prev,
        {
          side: "abos",
          text: `Done. ${person.name}'s ${person.product.toLowerCase()} stays on this WhatsApp thread with the catalog.`,
          time: "now",
        },
      ]);
      setLead(true);
    }, 850);
  }

  return (
    <div ref={stageRef} className="relative mx-auto w-full max-w-6xl">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-signal">WhatsApp is a channel</p>
          <p className="mt-1 max-w-xl text-sm text-harmattan-muted">
            Same business brain as the rest of ABOS — stock, delivery and the next action, never a second chatbot.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-widest text-quiet transition-[color,border-color] duration-150 hover:border-signal/20 hover:text-signal sm:flex"
        >
          <span className={cn("size-1.5 rounded-full", playing ? "bg-signal" : "bg-quiet")} />
          {playing ? "Playing" : "Paused"}
        </button>
      </div>

      <div className="abos-wa3d-stage relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#070d12] px-3 py-8 sm:px-8 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(110,231,183,.14),transparent_28%),radial-gradient(circle_at_88%_88%,rgba(52,211,153,.08),transparent_24%)]" />
        <div className="abos-wa3d-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[210px_minmax(0,1fr)_230px]">
          <aside className="abos-wa3d-rail hidden lg:block">
            <div className="rounded-[1.6rem] border border-white/10 bg-wa-bg/90 p-3 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-harmattan">Open chats</p>
                <Search className="size-3.5 text-quiet" />
              </div>
              {DEMO_THREADS.map((item, index) => {
                const row = PERSON[item.id];
                const active = index === threadIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setThreadIndex(index);
                      setPlaying(false);
                    }}
                    className={cn(
                      "mb-1 flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-[background-color] duration-150",
                      active ? "bg-signal/10 ring-1 ring-signal/20" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <img src={row.avatar} alt="" className="size-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-harmattan">
                        {row.name}
                        <span className="size-1.5 rounded-full bg-signal" />
                      </p>
                      <p className="truncate text-xs text-quiet">{row.preview}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="abos-wa3d-rig mx-auto w-full max-w-[380px]">
            <div className="abos-wa3d-bezel">
              <div className="flex items-center justify-between px-6 pt-3 text-xs text-harmattan-muted">
                <span>21:12</span>
                <span className="abos-wa3d-island" />
                <span>ABOS</span>
              </div>

              <div className="mt-1 flex items-center justify-between border-b border-white/5 bg-wa-header px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={person.avatar} alt="" className="size-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-wa-text">
                      {person.name}
                      <span className="size-1.5 rounded-full bg-signal" />
                    </p>
                    <p className="text-xs text-signal/80">online · via WhatsApp Business</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-signal/80">
                  <Video className="size-4" />
                  <Phone className="size-4" />
                  <MoreHorizontal className="size-4" />
                </div>
              </div>

              <div
                ref={scroller}
                className="abos-wa3d-wallpaper flex h-[430px] flex-col justify-end gap-2.5 overflow-y-auto px-3 py-4"
              >
                <p className="mx-auto rounded-full bg-black/25 px-3 py-1 text-xs uppercase tracking-widest text-quiet">
                  Today · ABOS is handling the conversation
                </p>

                {visible.map((message, index) => (
                  <div
                    key={`${thread.id}-${index}`}
                    className={cn("flex", message.side === "abos" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-5 text-wa-text shadow-lg",
                        message.side === "customer" ? "rounded-tl-sm bg-wa-in" : "rounded-tr-sm bg-wa-out",
                      )}
                    >
                      {message.product ? (
                        <ProductCard label={thread.productLabel} meta={thread.productMeta} />
                      ) : null}
                      <p>{message.text}</p>
                      <p
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-xs",
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

                {lead ? (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2 rounded-2xl rounded-tr-sm bg-signal px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[0_0_24px_rgba(110,231,183,.25)]">
                      <span className="size-1.5 rounded-full bg-onyx" />
                      {thread.action}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/5 bg-wa-header px-3 py-2.5">
                <div className="mb-2 flex gap-2 overflow-x-auto">
                  {thread.suggestions.slice(0, 2).map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => sendSuggestion(hint)}
                      className="shrink-0 rounded-full bg-signal/15 px-3 py-1.5 text-[11px] text-signal"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <p className="flex flex-1 items-center gap-2 rounded-full bg-[#2a3942] px-3 py-2 text-xs text-quiet">
                    <MapPin className="size-3.5 text-signal" />
                    ABOS replies from live catalog
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(true);
                      setThreadIndex((i) => (i + 1) % DEMO_THREADS.length);
                    }}
                    className="rounded-full bg-signal px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="abos-wa3d-intel hidden space-y-3 lg:block">
            <div className="rounded-[1.4rem] border border-signal/15 bg-signal/[0.06] p-4">
              <p className="text-xs uppercase tracking-widest text-signal">Business brain</p>
              <div className="mt-3 space-y-2 font-mono text-xs leading-5">
                <p className="text-signal/80">$ find_customer("{person.name}")</p>
                <p className="text-amber">→ {person.city} · {person.product}</p>
                <p className="text-signal/80">$ search_products("{person.product.toLowerCase()}")</p>
                <p className="text-amber">→ {thread.productMeta}</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-wa-bg/90 p-4">
              <p className="text-xs uppercase tracking-widest text-quiet">Thread context</p>
              <p className="mt-2 text-sm font-semibold text-harmattan">{person.name}</p>
              <p className="mt-1 text-xs leading-5 text-harmattan-muted">
                {person.preview} stays attached to the customer, the SKU and the next action.
              </p>
              <button
                type="button"
                onClick={() => setThreadIndex((i) => (i + 1) % DEMO_THREADS.length)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-signal"
              >
                Next thread <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          {DEMO_THREADS.map((item, index) => {
            const row = PERSON[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setThreadIndex(index);
                  setPlaying(false);
                }}
                className={cn(
                  "flex min-w-[168px] items-center gap-2 rounded-2xl border px-2.5 py-2",
                  index === threadIndex ? "border-signal/30 bg-signal/10" : "border-white/10 bg-white/[0.03]",
                )}
              >
                <img src={row.avatar} alt="" className="size-8 rounded-full object-cover" />
                <div className="text-left">
                  <p className="text-xs text-harmattan">{row.name}</p>
                  <p className="text-xs text-quiet">{row.product}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
