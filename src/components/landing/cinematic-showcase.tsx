import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AbosMark } from "@/components/landing/abos-mark";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: "signal", label: "Signal", copy: "Illustrative customer messages arrive. The cursor identifies the incoming signal." },
  { id: "intelligence", label: "Business intelligence", copy: "The ABOS emblem activates. Customer context, products, catalog and trusted knowledge connect." },
  { id: "operations", label: "Operations", copy: "Inventory checks, orders, payment review and delivery handoff become connected." },
  { id: "control", label: "Human control", copy: "Tasks, automations and team permissions appear. Sensitive activity remains pending approval." },
  { id: "future", label: "Connected future", copy: "African business intelligence. Connected operations. Real execution." },
] as const;

function chapterFromProgress(progress: number) {
  if (progress < 0.18) return 0;
  if (progress < 0.38) return 1;
  if (progress < 0.58) return 2;
  if (progress < 0.78) return 3;
  return 4;
}

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readCompactViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-height: 560px)").matches;
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

function ChapterList() {
  return (
    <ol className="mx-auto mt-6 grid max-w-3xl gap-3 text-left">
      {CHAPTERS.map((chapter, index) => (
        <li key={chapter.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-signal">
            Chapter {index + 1} · {chapter.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-harmattan-muted">{chapter.copy}</p>
        </li>
      ))}
    </ol>
  );
}

export function CinematicShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(readReducedMotion);
  const [compact, setCompact] = useState(readCompactViewport);
  const [chapter, setChapter] = useState(0);
  const staticView = reduced || compact;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const height = window.matchMedia("(max-height: 560px)");
    const sync = () => {
      setReduced(motion.matches);
      setCompact(height.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    height.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      height.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const host = hostRef.current;
    if (!stage || !track || !host || staticView) return;

    const q = (name: string) => stage.querySelectorAll<HTMLElement>(`[data-cine="${name}"]`);
    const one = (name: string) => host.querySelector<HTMLElement>(`[data-cine="${name}"]`);
    const cursorTarget = (id: string) => host.querySelector<HTMLElement>(`[data-cursor="${id}"]`);

    const point = (id: string) => {
      const el = cursorTarget(id);
      const hr = host.getBoundingClientRect();
      if (!el || hr.width < 8) return { x: 24, y: 24 };
      const tr = el.getBoundingClientRect();
      return {
        x: tr.left - hr.left + Math.min(tr.width * 0.72, 28),
        y: tr.top - hr.top + Math.min(22, tr.height * 0.45),
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
      gsap.set(cursor, {
        x: () => point("motion-title").x,
        y: () => point("motion-title").y,
        autoAlpha: 1,
      });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      stage.setAttribute("data-ready", "true");

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });

      const mark = (id: string, on: boolean) => {
        const target = cursorTarget(id);
        if (!target) return;
        if (on) target.setAttribute("data-hot", "true");
        else target.removeAttribute("data-hot");
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
        tl.call(() => mark(id, false), undefined, at + 0.42);
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
          duration: 0.22,
          ease: "power2.out",
          onUpdate: () => {
            wire.setAttribute("x2", String(wireState.x2));
            wire.setAttribute("y2", String(wireState.y2));
          },
        }, at);
      };

      tl.set(cursor, { autoAlpha: 1 }, 0);
      travel("motion-title", 0, 0.04);
      tl.to(messages, { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.04 }, 0.1);
      travel("signal", 0.16, 0.28);
      click("signal", 0.46);

      tl.to(halo, { autoAlpha: 1, duration: 0.18 }, 0.55);
      tl.to(emblem, { autoAlpha: 1, scale: 1, duration: 0.24, ease: "power3.out" }, 0.58);
      travel("emblem", 0.5, 0.2);
      click("emblem", 0.72);
      tl.to(messages, { autoAlpha: 0, duration: 0.16 }, 0.74);

      tl.to(cursorTarget("customers"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 }, 0.82);
      travel("customers", 0.84, 0.18);
      click("customers", 1.02);
      drawWire("emblem", "customers", 1.02);

      tl.to(cursorTarget("products"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 }, 1.18);
      travel("products", 1.2, 0.18);
      click("products", 1.38);
      drawWire("emblem", "products", 1.38);

      tl.to(cursorTarget("knowledge"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 }, 1.54);
      tl.to([cursorTarget("customers")], { autoAlpha: 0.28, duration: 0.14 }, 1.56);
      travel("knowledge", 1.56, 0.16);
      click("knowledge", 1.74);

      tl.to(cursorTarget("inventory"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 1.92);
      tl.to(cursorTarget("products"), { autoAlpha: 0.28, duration: 0.12 }, 1.94);
      travel("inventory", 1.94, 0.16);
      click("inventory", 2.1);
      drawWire("emblem", "inventory", 2.1);

      tl.to(cursorTarget("orders"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 2.26);
      tl.to(cursorTarget("knowledge"), { autoAlpha: 0.22, duration: 0.12 }, 2.28);
      travel("orders", 2.28, 0.16);
      click("orders", 2.44);
      drawWire("emblem", "orders", 2.44);

      tl.to(cursorTarget("delivery"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 2.6);
      tl.to(cursorTarget("inventory"), { autoAlpha: 0.22, duration: 0.12 }, 2.62);
      travel("delivery", 2.62, 0.16);
      click("delivery", 2.78);
      drawWire("emblem", "delivery", 2.78);

      tl.to(cursorTarget("tasks"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 3.02);
      tl.to([cursorTarget("orders"), cursorTarget("delivery")], { autoAlpha: 0.2, duration: 0.12 }, 3.04);
      travel("tasks", 3.04, 0.16);
      click("tasks", 3.2);
      drawWire("emblem", "tasks", 3.2);

      tl.to(cursorTarget("team"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 3.36);
      travel("team", 3.38, 0.16);
      click("team", 3.54);
      drawWire("emblem", "team", 3.54);

      tl.to([emblem, halo], { autoAlpha: 0.15, duration: 0.16 }, 3.74);
      tl.to(approval, { autoAlpha: 1, y: 0, duration: 0.2 }, 3.76);
      tl.to(cards, { autoAlpha: 0.12, duration: 0.14 }, 3.78);
      travel("approval", 3.78, 0.18);
      click("approval", 3.96);

      tl.to([cards, approval, wire], { autoAlpha: 0, duration: 0.2 }, 4.3);
      tl.to([emblem, halo], { autoAlpha: 1, duration: 0.2 }, 4.34);
      tl.to(emblem, { scale: 1.04, duration: 0.24 }, 4.38);
      tl.to(analytics, { autoAlpha: 1, y: 0, scale: 1, duration: 0.18 }, 4.56);
      travel("analytics", 4.58, 0.18);
      click("analytics", 4.76);
      tl.to(analytics, { autoAlpha: 0, duration: 0.16 }, 5.05);
      tl.to(statement, { autoAlpha: 1, y: 0, duration: 0.22 }, 5.12);
      travel("finale", 5.2, 0.2);

      ScrollTrigger.create({
        trigger: track,
        start: "top top+=64",
        end: "bottom bottom",
        scrub: 0.45,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = chapterFromProgress(self.progress);
          setChapter((current) => (current === next ? current : next));
          if (progress) gsap.set(progress, { scaleX: self.progress });
          if (railFillRef.current) railFillRef.current.style.transform = `scaleX(${self.progress})`;
        },
      });
    }, host);

    const refresh = () => ScrollTrigger.refresh();
    const resize = new ResizeObserver(refresh);
    resize.observe(stage);
    requestAnimationFrame(refresh);

    return () => {
      resize.disconnect();
      stage.removeAttribute("data-ready");
      ctx.revert();
    };
  }, [staticView]);

  const active = CHAPTERS[chapter] ?? CHAPTERS[0];

  return (
    <section id="showcase" className="relative z-10" aria-labelledby="showcase-title">
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 sm:pt-10">
        <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-quiet">Product preview</p>
          <h2 id="showcase-title" className="mt-3 font-display text-title font-semibold text-harmattan">
            One business. One connected intelligence.
          </h2>
          <p className="mt-3 text-sm text-harmattan-muted sm:text-base">
            Illustrative product preview. Not live traffic, stock, or payment activity.
          </p>
        </div>
      </div>

      {staticView ? (
        <div className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-8">
          <div className="cine-stage relative mx-auto aspect-[4/5] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] md:aspect-video">
            <Poster />
            <p className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-harmattan-muted">
              Illustrative product preview
            </p>
          </div>
          <ChapterList />
        </div>
      ) : (
        <div ref={trackRef} className="cine-track">
          <div ref={hostRef} className="cine-sticky relative px-4 sm:px-8">
            <div className="mb-2 flex items-end justify-between gap-4 lg:mb-3">
              <div className="min-w-0 flex-1 text-center lg:text-left">
                <div className="cine-signal-line mx-auto mb-2 hidden lg:mx-0 lg:block" aria-hidden="true" />
                <p data-cursor="motion-title" className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal lg:text-xs">
                  ABOS in motion
                </p>
                <p className="mx-auto mt-1 hidden max-w-md text-sm leading-snug text-harmattan-muted lg:mx-0 lg:block">
                  From the first customer signal to connected business execution.
                </p>
              </div>
              <p className="hidden shrink-0 pb-0.5 text-[11px] uppercase tracking-[0.16em] text-quiet lg:block">
                {String(chapter + 1).padStart(2, "0")} / 05 — {active.label}
              </p>
            </div>
            <div
              ref={stageRef}
              className="cine-stage cine-live relative mx-auto aspect-[4/5] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)] md:aspect-video"
            >
              <div className="cine-grid absolute inset-0" aria-hidden="true" />
              <div className="cine-glow absolute inset-0" aria-hidden="true" />
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

              <div data-cine="statement" data-cursor="finale" className="pointer-events-none absolute inset-x-0 bottom-[18%] px-6 text-center">
                <p className="mx-auto max-w-xl font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl">
                  African business intelligence. Connected operations. Real execution.
                </p>
              </div>
              <div data-cine="progress" className="absolute inset-x-0 bottom-0 z-[2] h-[2px] origin-left bg-signal/70" aria-hidden="true" />

              <p className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-harmattan-muted">
                Illustrative product preview
              </p>
              <div className="absolute bottom-3 left-3 right-3 z-30 flex items-end justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Scroll to explore</p>
                <div className="min-w-0 text-right">
                  <p className="sr-only" aria-live="polite">
                    Chapter {chapter + 1} of 5. {active.label}. {active.copy}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-[0.14em] text-harmattan" aria-hidden="true">
                    {chapter + 1}/5 · {active.label}
                  </p>
                  <div className="mt-1 flex justify-end gap-1" aria-hidden="true">
                    {CHAPTERS.map((item, index) => (
                      <span
                        key={item.id}
                        className={cn("h-1 w-4 rounded-full", index <= chapter ? "bg-signal" : "bg-white/15")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <ol className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 lg:hidden" aria-hidden="true">
              {CHAPTERS.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.12em]",
                    index === chapter ? "text-signal" : "text-quiet",
                  )}
                >
                  {item.label}
                </li>
              ))}
            </ol>
            <div className="cine-rail relative mt-3 hidden lg:block" aria-hidden="true">
              <div className="cine-rail-line">
                <div ref={railFillRef} className="cine-rail-fill" />
              </div>
              <ol className="cine-rail-nodes">
                {CHAPTERS.map((item, index) => (
                  <li
                    key={item.id}
                    className={cn(
                      "cine-rail-node",
                      index === chapter && "is-active",
                      index < chapter && "is-done",
                    )}
                  >
                    <span className="cine-rail-dot" />
                    <span className="cine-rail-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="cine-rail-label">{item.label}</span>
                  </li>
                ))}
              </ol>
            </div>
            <CursorGraphic />
          </div>
        </div>
      )}
    </section>
  );
}
