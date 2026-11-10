import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AbosMark } from "@/components/landing/abos-mark";
import { cn } from "@/lib/utils";

const LOOP = 10.6;

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ModuleCard({
  id,
  className,
  kicker,
  title,
  detail,
  status,
}: {
  id: string;
  className?: string;
  kicker: string;
  title: string;
  detail: string;
  status?: string;
}) {
  return (
    <div data-cine="card" data-cursor={id} className={cn("cine-glass w-[44%] max-w-[230px]", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-signal">{kicker}</p>
      <p className="mt-1 font-display text-sm font-semibold tracking-normal text-harmattan">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-harmattan-muted">{detail}</p>
      {status ? (
        <p className="mt-2 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber">
          {status}
        </p>
      ) : null}
    </div>
  );
}

function Poster() {
  return (
    <div className="absolute inset-0">
      <div className="cine-grid absolute inset-0" aria-hidden="true" />
      <div className="cine-glow absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AbosMark glow className="h-24 w-auto sm:h-32" title="" />
        <p className="mt-5 max-w-md font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl">
          African business intelligence. Connected operations. Real execution.
        </p>
      </div>
      <div className="cine-glass bottom-[18%] left-[6%] hidden w-[200px] md:block">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-signal">Customers</p>
        <p className="mt-1 font-display text-sm font-semibold text-harmattan">Context held</p>
        <p className="mt-1 text-[11px] text-harmattan-muted">Who they are stays attached to the work.</p>
      </div>
      <div className="cine-glass bottom-[18%] right-[6%] hidden w-[200px] md:block">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-signal">Orders</p>
        <p className="mt-1 font-display text-sm font-semibold text-harmattan">Work in view</p>
        <p className="mt-1 text-[11px] text-harmattan-muted">Requests sit with the operation.</p>
      </div>
      <div className="cine-glass absolute bottom-[8%] left-1/2 w-[min(92%,320px)] -translate-x-1/2 border-amber-200/25">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber">Human control</p>
        <p className="mt-1 font-display text-sm font-semibold text-harmattan">Held for review</p>
        <p className="mt-1 text-[11px] leading-snug text-harmattan-muted">Nothing sensitive executes before someone authorised approves it.</p>
      </div>
    </div>
  );
}

function CursorGraphic() {
  return (
    <div data-cine="cursor" className="cine-cursor" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M5 3.2 22.4 13.1c.8.45.62 1.64-.28 1.84l-6.7 1.5-1.7 6.55c-.22.86-1.38.96-1.76.16L5.2 4.7c-.28-.6.28-1.22.8-1.5Z"
          fill="#f4fff9"
          stroke="#06281c"
          strokeWidth="1.2"
        />
        <path
          d="M6.2 5.2 19.6 13.2l-5.5 1.22"
          stroke="#6ee7b7"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
      <span data-cine="ripple" className="cine-ripple" />
    </div>
  );
}

export function CinematicShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const [reduced, setReduced] = useState(readReducedMotion);
  const [paused, setPaused] = useState(false);
  const [scene, setScene] = useState("Signal arrives");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const q = (name: string) => stage.querySelectorAll<HTMLElement>(`[data-cine="${name}"]`);
    const one = (name: string) => stage.querySelector<HTMLElement>(`[data-cine="${name}"]`);
    const cursorTarget = (id: string) => stage.querySelector<HTMLElement>(`[data-cursor="${id}"]`);

    const point = (id: string) => {
      const el = cursorTarget(id);
      const sr = stage.getBoundingClientRect();
      if (!el || sr.width < 8) return { x: 24, y: 24 };
      const tr = el.getBoundingClientRect();
      return {
        x: tr.left - sr.left + tr.width * 0.62,
        y: tr.top - sr.top + Math.min(34, Math.max(12, tr.height * 0.38)),
      };
    };

    const ctx = gsap.context(() => {
      const messages = q("message");
      const cards = q("card");
      const emblem = one("emblem");
      const halo = one("halo");
      const approval = one("approval");
      const statement = one("statement");
      const analytics = cursorTarget("analytics");
      const cursor = one("cursor");
      const ripple = one("ripple");
      const wire = one("wire");
      const progress = one("progress");
      const wireState = { x2: 0, y2: 0 };

      gsap.set([messages, cards, emblem, halo, approval, statement, analytics, cursor, ripple], { autoAlpha: 0 });
      gsap.set(messages, { y: 10 });
      gsap.set(cards, { y: 12, scale: 0.98 });
      gsap.set(emblem, { scale: 0.9 });
      gsap.set(approval, { y: 10 });
      gsap.set(statement, { y: 8 });
      gsap.set(cursor, { x: 12, y: 28 });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      stage.setAttribute("data-ready", "true");

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.2,
        defaults: { ease: "power2.out" },
        onStart: () => setScene("Signal arrives"),
        onRepeat: () => setScene("Signal arrives"),
      });

      const mark = (id: string, on: boolean) => {
        cursorTarget(id)?.toggleAttribute("data-hot", on);
      };

      const travel = (id: string, at: number, duration = 0.28) => {
        tl.to(cursor, {
          autoAlpha: 1,
          x: () => point(id).x,
          y: () => point(id).y,
          duration,
          ease: "power3.inOut",
        }, at);
      };

      const click = (id: string, at: number) => {
        tl.call(() => mark(id, true), undefined, at);
        tl.fromTo(ripple, { autoAlpha: 0.85, scale: 0.35 }, { autoAlpha: 0, scale: 1.7, duration: 0.28, ease: "power2.out" }, at);
        tl.call(() => mark(id, false), undefined, at + 0.62);
      };

      const drawWire = (from: string, to: string, at: number) => {
        if (!wire) return;
        tl.call(() => {
          const a = point(from);
          wireState.x2 = a.x;
          wireState.y2 = a.y;
          wire.setAttribute("x1", String(a.x));
          wire.setAttribute("y1", String(a.y));
          wire.setAttribute("x2", String(a.x));
          wire.setAttribute("y2", String(a.y));
          gsap.set(wire, { autoAlpha: 1 });
        }, undefined, at);
        tl.to(wireState, {
          x2: () => point(to).x,
          y2: () => point(to).y,
          duration: 0.26,
          ease: "power2.out",
          onUpdate: () => {
            wire.setAttribute("x2", String(wireState.x2));
            wire.setAttribute("y2", String(wireState.y2));
          },
        }, at);
      };

      tl.set(cursor, { autoAlpha: 1 }, 0);
      tl.to(messages, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.06 }, 0.05);
      travel("signal", 0.12, 0.32);
      click("signal", 0.46);

      tl.call(() => setScene("Business intelligence"), undefined, 0.85);
      tl.to(halo, { autoAlpha: 1, duration: 0.25 }, 0.85);
      tl.to(emblem, { autoAlpha: 1, scale: 1, duration: 0.32, ease: "power3.out" }, 0.88);
      travel("emblem", 0.72, 0.28);
      click("emblem", 1.02);
      tl.to(messages, { autoAlpha: 0, duration: 0.2 }, 1.05);

      tl.to(cursorTarget("customers"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.26 }, 1.15);
      travel("customers", 1.18, 0.26);
      click("customers", 1.46);
      drawWire("emblem", "customers", 1.46);

      tl.to(cursorTarget("products"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.26 }, 1.78);
      travel("products", 1.8, 0.26);
      click("products", 2.08);
      drawWire("emblem", "products", 2.08);

      tl.to(cursorTarget("knowledge"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.26 }, 2.4);
      tl.to([cursorTarget("customers")], { autoAlpha: 0.28, duration: 0.2 }, 2.45);
      travel("knowledge", 2.42, 0.24);
      click("knowledge", 2.68);

      tl.call(() => setScene("Operations connect"), undefined, 3.05);
      tl.to(cursorTarget("inventory"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 3.08);
      tl.to(cursorTarget("products"), { autoAlpha: 0.28, duration: 0.18 }, 3.1);
      travel("inventory", 3.1, 0.24);
      click("inventory", 3.36);
      drawWire("emblem", "inventory", 3.36);

      tl.to(cursorTarget("orders"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 3.62);
      tl.to(cursorTarget("knowledge"), { autoAlpha: 0.22, duration: 0.16 }, 3.64);
      travel("orders", 3.64, 0.24);
      click("orders", 3.9);
      drawWire("emblem", "orders", 3.9);

      tl.to(cursorTarget("delivery"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 4.16);
      tl.to(cursorTarget("inventory"), { autoAlpha: 0.22, duration: 0.16 }, 4.18);
      travel("delivery", 4.18, 0.24);
      click("delivery", 4.44);
      drawWire("emblem", "delivery", 4.44);

      tl.call(() => setScene("Human control"), undefined, 4.85);
      tl.to(cursorTarget("tasks"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 4.88);
      tl.to([cursorTarget("orders"), cursorTarget("delivery")], { autoAlpha: 0.2, duration: 0.16 }, 4.9);
      travel("tasks", 4.9, 0.24);
      click("tasks", 5.16);
      drawWire("emblem", "tasks", 5.16);

      tl.to(cursorTarget("team"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 5.42);
      travel("team", 5.44, 0.24);
      click("team", 5.7);
      drawWire("emblem", "team", 5.7);

      tl.to([emblem, halo], { autoAlpha: 0.15, duration: 0.22 }, 6.05);
      tl.to(approval, { autoAlpha: 1, y: 0, duration: 0.28 }, 6.08);
      tl.to(cards, { autoAlpha: 0.12, duration: 0.2 }, 6.1);
      travel("approval", 6.12, 0.26);
      click("approval", 6.4);

      tl.call(() => setScene("Connected future"), undefined, 7.15);
      tl.to([cards, approval, wire], { autoAlpha: 0, duration: 0.28 }, 7.15);
      tl.to([emblem, halo], { autoAlpha: 1, duration: 0.28 }, 7.2);
      tl.to(emblem, { scale: 1.04, duration: 0.35 }, 7.25);
      tl.to(analytics, { autoAlpha: 1, y: 0, scale: 1, duration: 0.26 }, 7.55);
      travel("analytics", 7.58, 0.28);
      click("analytics", 7.88);
      tl.to(analytics, { autoAlpha: 0, duration: 0.22 }, 8.45);
      tl.to(statement, { autoAlpha: 1, y: 0, duration: 0.32 }, 8.55);
      travel("finale", 8.7, 0.3);

      if (progress) {
        tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: LOOP, ease: "none" }, 0);
      }

      timelineRef.current = tl;
    }, stage);

    const syncPlayback = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      const shouldPlay = inView.current && document.visibilityState === "visible" && !userPaused.current;
      if (shouldPlay) tl.play();
      else tl.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) inView.current = true;
        else if (!entry.isIntersecting || entry.intersectionRatio < 0.05) inView.current = false;
        syncPlayback();
      },
      { threshold: [0, 0.05, 0.15, 0.4], rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(stage);

    const onVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      timelineRef.current?.invalidate();
    };
    const resize = new ResizeObserver(onResize);
    resize.observe(stage);

    return () => {
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeAttribute("data-ready");
      ctx.revert();
      timelineRef.current = null;
    };
  }, [reduced]);

  const togglePause = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    const tl = timelineRef.current;
    if (!tl) return;
    if (userPaused.current) tl.pause();
    else if (inView.current && document.visibilityState === "visible") tl.play();
  };

  const replay = () => {
    const tl = timelineRef.current;
    if (!tl) return;
    userPaused.current = false;
    setPaused(false);
    setScene("Signal arrives");
    tl.restart();
    if (!inView.current || document.visibilityState !== "visible") tl.pause();
  };

  return (
    <section id="showcase" className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10" aria-labelledby="showcase-title">
      <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">ABOS in motion</p>
        <h2 id="showcase-title" className="mt-3 font-display text-title font-semibold text-harmattan">
          One business. One connected intelligence.
        </h2>
        <p className="mt-3 text-sm text-harmattan-muted sm:text-base">
          Illustrative product preview. Not live traffic, stock, or payment activity.
        </p>
      </div>

      <div
        ref={stageRef}
        className={cn(
          "cine-stage relative mx-auto aspect-[4/5] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)] md:aspect-video",
          !reduced && "cine-live",
        )}
      >
        <div className="cine-grid absolute inset-0" aria-hidden="true" />
        <div className="cine-glow absolute inset-0" aria-hidden="true" />

        {reduced ? (
          <Poster />
        ) : (
          <>
            <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
              <line data-cine="wire" x1="0" y1="0" x2="0" y2="0" stroke="rgba(110,231,183,0.8)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <div data-cine="message" data-cursor="signal" className="cine-glass left-[4%] top-[7%] w-[58%] max-w-[230px] md:left-[6%] md:top-[10%] md:w-[220px]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative message</p>
              <p className="mt-1 text-xs leading-snug text-harmattan md:text-sm">Can you still help me with this order?</p>
            </div>
            <div data-cine="message" className="cine-glass right-[4%] top-[7%] hidden w-[220px] md:block">
              <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative message</p>
              <p className="mt-1 text-sm leading-snug text-harmattan">Is delivery open this week?</p>
            </div>

            <div data-cine="halo" className="cine-halo" aria-hidden="true" />
            <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 md:top-1/2">
              <div data-cine="emblem" data-cursor="emblem">
                <AbosMark glow className="h-20 w-auto sm:h-24 md:h-32" title="" />
              </div>
            </div>

            <ModuleCard id="customers" className="left-[4%] top-[16%] md:left-[4%] md:top-[12%] md:w-[220px]" kicker="Customers and leads" title="Shared context" detail="The person stays attached to the thread." />
            <ModuleCard id="products" className="right-[4%] top-[16%] md:right-[4%] md:top-[12%] md:w-[220px]" kicker="Products and catalog" title="What they mean" detail="The offer stays next to the question." />
            <ModuleCard id="knowledge" className="left-[4%] top-[38%] md:left-[4%] md:top-[38%] md:w-[230px]" kicker="AI rules and knowledge" title="What ABOS can use" detail="Prior context is available, not guessed." />
            <ModuleCard id="inventory" className="right-[4%] top-[38%] md:right-[4%] md:top-[38%] md:w-[220px]" kicker="Inventory" title="Catalog context" detail="A check is required before anyone treats stock as fact." status="Check required" />
            <ModuleCard id="orders" className="left-[4%] top-[16%] md:left-[4%] md:top-[12%] md:w-[230px]" kicker="Orders and payments" title="Pending verification" detail="Payment stays unverified until a person confirms it." status="Pending human verification" />
            <ModuleCard id="delivery" className="right-[4%] top-[16%] md:right-[4%] md:top-[12%] md:w-[220px]" kicker="Delivery and handoff" title="Not confirmed" detail="Handoff waits for confirmation." status="Awaiting confirmation" />
            <ModuleCard id="tasks" className="left-[4%] top-[38%] md:left-[4%] md:top-[38%] md:w-[230px]" kicker="Tasks and automations" title="Work queued" detail="A step can be prepared. It does not run itself past a hold." />
            <ModuleCard id="team" className="right-[4%] top-[38%] md:right-[4%] md:top-[38%] md:w-[230px]" kicker="Team and permissions" title="Owner, Admin, Agent, Viewer" detail="Roles decide who may review a sensitive step." />

            <div className="absolute left-1/2 top-[14%] z-[3] w-[min(88%,360px)] -translate-x-1/2 md:top-[12%]">
              <div data-cine="approval" data-cursor="approval" className="cine-glass cine-inline w-full border-amber-200/30 bg-[#10160f]">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber">Human control</p>
                <p className="mt-1 font-display text-base font-semibold text-harmattan">Awaiting approval</p>
                <p className="mt-1 text-xs leading-snug text-harmattan">A sensitive action is held. It has not been executed.</p>
                <p className="mt-2 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber">Not executed</p>
              </div>
            </div>

            <div className="absolute left-[4%] top-[16%] w-[min(78%,280px)] md:left-1/2 md:top-[14%] md:w-[280px] md:-translate-x-1/2">
              <div data-cursor="analytics" data-cine="card" className="cine-glass cine-inline w-full">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-signal">Analytics</p>
                <p className="mt-1 font-display text-sm font-semibold text-harmattan">Business insights</p>
                <p className="mt-1 text-[11px] text-harmattan-muted">The operating picture comes together. No live totals are shown here.</p>
              </div>
            </div>

            <div data-cine="statement" data-cursor="finale" className="pointer-events-none absolute inset-x-0 bottom-[18%] px-6 pr-24 text-center">
              <p className="mx-auto max-w-xl font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl">
                African business intelligence. Connected operations. Real execution.
              </p>
            </div>
            <div data-cine="progress" className="absolute inset-x-0 bottom-0 z-[2] h-[2px] origin-left bg-signal/70" aria-hidden="true" />
            <CursorGraphic />
          </>
        )}

        <p className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-harmattan-muted">
          Illustrative product preview
        </p>

        {reduced ? null : (
          <div className="cine-controls absolute bottom-3 right-3 z-30 flex items-center gap-2">
            <span className="sr-only" aria-live="polite">{scene}</span>
            <span className="hidden rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-quiet sm:inline" aria-hidden="true">
              {scene}
            </span>
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Play product preview" : "Pause product preview"}
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/70 text-harmattan"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay product preview"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/70 text-harmattan"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
