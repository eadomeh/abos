import { CheckCheck, ChevronRight, MoreHorizontal, Package, Pause, Phone, Play, Search, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LIVE_THREADS } from "@/components/landing/chat-data";
import { PERSON } from "@/components/landing/people";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const DEMO_THREADS = LIVE_THREADS.slice(0, 5);

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tr-sm bg-wa-out/40 px-3 py-2" aria-hidden="true">
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
      <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
    </div>
  );
}

function ProductCard({ label, meta }: { label: string; meta: string }) {
  return (
    <div className="wa-product-context mb-2 overflow-hidden rounded-xl bg-black/20">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal/15 text-signal">
          <Package className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-signal/70">Scripted catalog</p>
          <p className="truncate text-xs font-semibold text-wa-text">{label}</p>
          <p className="truncate text-xs text-signal/80">{meta}</p>
        </div>
      </div>
    </div>
  );
}

export function WhatsappThread() {
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stepRef = useRef(1);
  const [threadIndex, setThreadIndex] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [booted, setBooted] = useState(false);
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [lead, setLead] = useState(false);

  const thread = DEMO_THREADS[threadIndex] ?? DEMO_THREADS[0]!;
  const person = PERSON[thread.id];
  const catalog = thread.messages;
  const visible = useMemo(
    () => catalog.slice(0, Math.max(1, Math.min(shown, catalog.length))),
    [catalog, shown],
  );
  const canPlay = !reduced && !manualPause && inView && !tabHidden;

  useEffect(() => {
    const node = stageRef.current;
    const syncTab = () => setTabHidden(document.visibilityState === "hidden");
    syncTab();
    document.addEventListener("visibilitychange", syncTab);

    if (!node || !("IntersectionObserver" in window)) {
      setInView(true);
      setBooted(true);
      return () => document.removeEventListener("visibilitychange", syncTab);
    }

    const io = new IntersectionObserver(([entry]) => {
      const visibleNow = Boolean(entry?.isIntersecting);
      setInView(visibleNow);
      if (visibleNow) setBooted(true);
    }, { threshold: 0.12 });

    io.observe(node);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", syncTab);
    };
  }, []);

  useEffect(() => {
    const length = DEMO_THREADS[threadIndex]?.messages.length ?? 1;
    const full = reduced ? length : 1;
    stepRef.current = full;
    setShown(full);
    setTyping(false);
    setCatalogReady(reduced);
    setLead(reduced);
  }, [threadIndex, reduced]);

  useEffect(() => {
    if (!canPlay) {
      setTyping(false);
      return;
    }

    const messages = DEMO_THREADS[threadIndex]?.messages ?? [];
    const timers: number[] = [];
    let cancelled = false;

    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms));
    };

    const play = () => {
      if (cancelled) return;
      if (stepRef.current >= messages.length) {
        later(() => {
          setCatalogReady(true);
          setLead(true);
          later(() => {
            setThreadIndex((i) => (i + 1) % DEMO_THREADS.length);
          }, 3400);
        }, 900);
        return;
      }

      const next = messages[stepRef.current];
      if (next?.side === "abos") {
        setTyping(true);
        later(() => {
          stepRef.current += 1;
          setShown(stepRef.current);
          setTyping(false);
          if (messages[stepRef.current - 1]?.product) setCatalogReady(true);
          later(play, 1600);
        }, 1100);
        return;
      }

      later(() => {
        stepRef.current += 1;
        setShown(stepRef.current);
        later(play, 1300);
      }, 280);
    };

    later(play, stepRef.current <= 1 ? 900 : 420);

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [canPlay, threadIndex]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible.length, typing, lead]);

  function choose(index: number) {
    setManualPause(true);
    setThreadIndex(index);
  }

  return (
    <div
      ref={stageRef}
      className={cn("relative mx-auto w-full max-w-6xl", booted && "wa-demo-booted", !canPlay && "wa-playback-paused")}
    >
      <div className="wa-channel-intro mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-signal">WhatsApp is a channel</p>
          <p className="mt-1 max-w-xl text-sm text-harmattan-muted">
            Same business brain as the rest of ABOS — stock, delivery and the next action, never a second chatbot.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setManualPause((paused) => !paused)}
          aria-pressed={!manualPause}
          aria-label={manualPause ? "Play illustrative WhatsApp demo" : "Pause illustrative WhatsApp demo"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs uppercase tracking-widest text-quiet transition-[color,border-color] duration-150 hover:border-signal/20 hover:text-signal"
        >
          {manualPause ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          <span className={cn("size-1.5 rounded-full", canPlay ? "bg-signal" : "bg-quiet")} aria-hidden="true" />
          {manualPause ? "Paused" : "Playing"}
        </button>
      </div>

      <div className="abos-wa3d-stage relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#070d12] px-3 py-6 sm:px-8 sm:py-12">
        <div className="wa-system-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(110,231,183,.14),transparent_28%),radial-gradient(circle_at_88%_88%,rgba(52,211,153,.08),transparent_24%)]" data-scroll-depth="7" />
        <div className="abos-wa3d-grid wa-system-grid pointer-events-none absolute inset-0 opacity-40" data-scroll-depth="3" />

        <div className="relative grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)_minmax(0,230px)]">
          <aside className="abos-wa3d-rail hidden min-w-0 lg:block">
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
                    aria-pressed={active}
                    onClick={() => choose(index)}
                    className={cn(
                      "mb-1 flex min-h-11 w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-[background-color,box-shadow] duration-200",
                      active ? "wa-thread-active bg-signal/10" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <img src={row.avatar} alt="" className="size-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-harmattan">
                        <span className="truncate">{row.name}</span>
                        <span className={cn("size-1.5 shrink-0 rounded-full", active ? "bg-signal" : "bg-white/20")} />
                      </p>
                      <p className="truncate text-xs text-quiet">{row.preview}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="abos-wa3d-rig mx-auto w-full min-w-0 max-w-[380px]">
            <div className="abos-wa3d-bezel">
              <div className="flex items-center justify-between px-5 pt-3 text-xs text-harmattan-muted">
                <span>21:12</span>
                <span className="abos-wa3d-island" />
                <span>ABOS</span>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-b border-white/5 bg-wa-header px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={person.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-wa-text">
                      <span className="truncate">{person.name}</span>
                      <span className="size-1.5 shrink-0 rounded-full bg-signal" />
                    </p>
                    <p className="truncate text-xs text-signal/80">online · scripted demo</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-signal/80" aria-hidden="true">
                  <Video className="size-4" />
                  <Phone className="size-4" />
                  <MoreHorizontal className="size-4" />
                </div>
              </div>

              <div
                ref={scroller}
                className="abos-wa3d-wallpaper flex h-[400px] flex-col justify-end gap-2.5 overflow-y-auto px-3 py-4 sm:h-[430px]"
                aria-live="polite"
              >
                <p className="mx-auto rounded-full bg-black/25 px-3 py-1 text-center text-[10px] uppercase tracking-widest text-quiet">
                  Today · illustrative ABOS reply
                </p>

                {visible.map((message, index) => (
                  <div
                    key={`${thread.id}-${index}`}
                    className={cn("wa-chat-message flex", message.side === "abos" ? "justify-end" : "justify-start")}
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
                          message.side === "abos" ? "text-signal" : "text-wa-meta",
                        )}
                      >
                        {message.time}
                        {message.side === "abos" ? <CheckCheck className="size-3" /> : null}
                      </p>
                    </div>
                  </div>
                ))}

                {typing && canPlay ? (
                  <div className="flex justify-end">
                    <TypingDots />
                  </div>
                ) : null}

                {lead ? (
                  <div className="wa-next-action flex justify-end">
                    <div className="max-w-[90%] rounded-2xl rounded-tr-sm bg-signal px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[0_0_24px_rgba(110,231,183,.25)]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-onyx/70">Illustrative next step</p>
                      <p className="mt-0.5 flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-onyx" />
                        {thread.action}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/5 bg-wa-header px-3 py-2.5">
                <p className="wa-demo-caption flex items-center justify-center gap-2 rounded-full bg-[#2a3942] px-3 py-2 text-center text-[11px] text-quiet">
                  <span className="size-1.5 shrink-0 rounded-full bg-signal/70" aria-hidden="true" />
                  Illustrative demo · Not a live chat
                </p>
              </div>
            </div>
          </div>

          <div key={thread.id} className="abos-wa3d-intel hidden min-w-0 space-y-3 lg:block">
            <ContextPanel
              name={person.name}
              city={person.city}
              product={person.product}
              preview={person.preview}
              productMeta={thread.productMeta}
              action={thread.action}
              catalogReady={catalogReady}
              lead={lead}
              onNext={() => setThreadIndex((i) => (i + 1) % DEMO_THREADS.length)}
            />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2 lg:hidden">
          {DEMO_THREADS.map((item, index) => {
            const row = PERSON[item.id];
            const active = index === threadIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(index)}
                className={cn(
                  "flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-2 text-left",
                  active ? "wa-thread-active border-signal/30 bg-signal/10" : "border-white/10 bg-white/[0.03]",
                )}
              >
                <img src={row.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-xs text-harmattan">{row.name}</span>
                  <span className="block truncate text-xs text-quiet">{row.product}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div key={`mobile-${thread.id}`} className="mt-3 lg:hidden">
          <ContextPanel
            name={person.name}
            city={person.city}
            product={person.product}
            preview={person.preview}
            productMeta={thread.productMeta}
            action={thread.action}
            catalogReady={catalogReady}
            lead={lead}
            onNext={() => setThreadIndex((i) => (i + 1) % DEMO_THREADS.length)}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function ContextPanel({
  name,
  city,
  product,
  preview,
  productMeta,
  action,
  catalogReady,
  lead,
  onNext,
  compact = false,
}: {
  name: string;
  city: string;
  product: string;
  preview: string;
  productMeta: string;
  action: string;
  catalogReady: boolean;
  lead: boolean;
  onNext: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-3", compact && "rounded-[1.4rem] border border-white/10 bg-wa-bg/80 p-3")}>
      <div className={cn("rounded-[1.4rem] border border-signal/15 bg-signal/[0.06] p-4", compact && "border-0 bg-transparent p-1")}>
        <p className="text-xs uppercase tracking-widest text-signal">Business brain</p>
        <div className="mt-3 space-y-2 font-mono text-xs leading-5">
          <p className="break-words text-signal/80">$ find_customer("{name}")</p>
          <p className="break-words text-amber">→ {city} · {product}</p>
          <p className={cn("break-words text-signal/80 transition-opacity duration-300", catalogReady ? "opacity-100" : "opacity-35")}>
            $ search_products("{product.toLowerCase()}")
          </p>
          <p className={cn("break-words text-amber transition-opacity duration-300", catalogReady ? "opacity-100" : "opacity-35")}>
            → {productMeta}
          </p>
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-quiet">Scripted catalog line · not live stock</p>
      </div>
      <div className={cn("rounded-[1.4rem] border border-white/10 bg-wa-bg/90 p-4", compact && "border-white/8 bg-white/[0.03]")}>
        <p className="text-xs uppercase tracking-widest text-quiet">Thread context</p>
        <p className="mt-2 text-sm font-semibold text-harmattan">{name}</p>
        <p className="mt-1 text-xs leading-5 text-harmattan-muted">
          {preview} stays attached to the customer, the catalog line and the next step.
        </p>
        <p className={cn("mt-2 text-xs font-medium text-signal transition-opacity duration-300", lead ? "opacity-100" : "opacity-40")}>
          {lead ? action : "Next step appears after the scripted reply."}
        </p>
        <button
          type="button"
          onClick={onNext}
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs text-signal"
        >
          Next thread <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
