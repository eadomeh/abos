import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { AbosMark } from "@/components/landing/abos-mark";
import { cn } from "@/lib/utils";

const BEAT = 3.7;
const SCENES = [
  { id: "01", name: "Customer signal" },
  { id: "02", name: "Customer 360" },
  { id: "03", name: "Business intelligence" },
  { id: "04", name: "Inventory and order" },
  { id: "05", name: "Payment verification" },
  { id: "06", name: "Delivery and handoff" },
  { id: "07", name: "Command centre" },
] as const;

const MOVES: { id: string; at: number }[][] = [
  [{ id: "s0-enquiry", at: 0.28 }, { id: "s0-context", at: 1.55 }],
  [{ id: "s1-profile", at: 0.28 }, { id: "s1-catalogue", at: 1.55 }],
  [{ id: "s2-reply", at: 0.28 }, { id: "s2-sources", at: 1.55 }],
  [{ id: "s3-stock", at: 0.28 }, { id: "s3-draft", at: 1.55 }],
  [{ id: "s4-claim", at: 0.28 }, { id: "s4-review", at: 1.55 }],
  [{ id: "s5-task", at: 0.28 }, { id: "s5-delivery", at: 1.55 }],
  [
    { id: "s6-customers", at: 0.22 },
    { id: "s6-knowledge", at: 0.72 },
    { id: "s6-commerce", at: 1.22 },
    { id: "s6-ops", at: 1.72 },
    { id: "s6-analytics", at: 2.2 },
    { id: "s6-finale", at: 2.7 },
  ],
];

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Card({
  target,
  kicker,
  title,
  detail,
  status,
  tone = "signal",
  className,
}: {
  target: string;
  kicker: string;
  title: string;
  detail: string;
  status?: string;
  tone?: "signal" | "amber";
  className?: string;
}) {
  return (
    <div data-cine="card" data-target={target} className={cn("cine-glass cine-inline", tone === "amber" && "border-amber-200/30", className)}>
      <p className={cn("text-[10px] font-medium uppercase tracking-[0.16em]", tone === "amber" ? "text-amber" : "text-signal")}>{kicker}</p>
      <p className="mt-1 font-display text-sm font-semibold leading-snug text-harmattan">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-harmattan-muted">{detail}</p>
      {status ? (
        <p className={cn(
          "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
          tone === "amber" ? "border-amber-200/30 bg-amber-200/10 text-amber" : "border-white/10 bg-white/5 text-quiet",
        )}>
          {status}
        </p>
      ) : null}
    </div>
  );
}

function SceneFrame({ index, dense, children }: { index: number; dense?: boolean; children: ReactNode }) {
  return (
    <div data-cine="scene" data-scene={index} className="absolute inset-0 z-[2] px-3 pb-16 pt-12 md:px-6 md:pb-[4.5rem] md:pt-14">
      <div className={cn(
        "mx-auto grid h-full max-w-5xl content-start gap-2 overflow-hidden sm:grid-cols-2 md:grid-cols-3 md:content-center md:gap-3",
        dense ? "grid-cols-2 gap-1.5" : "grid-cols-1",
      )}>
        {children}
      </div>
    </div>
  );
}

function Pointer() {
  return (
    <div data-cine="cursor" className="cine-cursor" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
          d="M5.2 3.4 24.2 14.2c.86.48.66 1.76-.3 1.96l-7.15 1.55-1.72 7c-.22.9-1.46 1.02-1.86.16L4.4 5c-.3-.64.3-1.3.8-1.6Z"
          fill="#f4fff9"
          stroke="#6ee7b7"
          strokeWidth="1.35"
        />
      </svg>
      <span data-cine="ripple" className="cine-ripple" />
    </div>
  );
}

function MiniChart() {
  const bars = [8, 14, 11, 18, 15, 22, 17];
  return (
    <svg data-cine="chart" viewBox="0 0 120 36" className="mt-2 h-8 w-full" aria-hidden="true">
      {bars.map((height, index) => (
        <rect
          key={index}
          data-cine="bar"
          x={4 + index * 16}
          y={32 - height}
          width="10"
          height={height}
          rx="2"
          fill={index === bars.length - 1 ? "#6ee7b7" : "rgba(110,231,183,0.45)"}
        />
      ))}
    </svg>
  );
}

function Poster() {
  return (
    <div className="absolute inset-0" data-cine-poster>
      <div className="cine-grid absolute inset-0" aria-hidden="true" />
      <div className="cine-glow absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <AbosMark glow className="h-24 w-auto sm:h-32" title="" />
        <p className="mt-4 max-w-md font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl">
          One business. One connected intelligence.
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative demo data</p>
      </div>
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
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const scenes = SCENES.map((_, index) => stage.querySelector<HTMLElement>(`[data-scene="${index}"]`));
    const cards = stage.querySelectorAll<HTMLElement>("[data-cine='card']");
    const emblem = stage.querySelector<HTMLElement>("[data-cine='emblem']");
    const halo = stage.querySelector<HTMLElement>("[data-cine='halo']");
    const progress = stage.querySelector<HTMLElement>("[data-cine='progress']");
    const sweep = stage.querySelector<HTMLElement>("[data-cine='sweep']");
    const cursor = stage.querySelector<HTMLElement>("[data-cine='cursor']");
    const ripple = stage.querySelector<HTMLElement>("[data-cine='ripple']");
    const wire = stage.querySelector<SVGPathElement>("[data-cine='wire']");
    const pulse = stage.querySelector<SVGCircleElement>("[data-cine='pulse']");
    const bars = stage.querySelectorAll<SVGRectElement>("[data-cine='bar']");

    const targetEl = (id: string) => {
      const el = stage.querySelector<HTMLElement>(`[data-target="${id}"]`);
      if (!el) return null;
      const box = el.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return null;
      return el;
    };

    const tip = (id: string) => {
      const el = targetEl(id);
      const sr = stage.getBoundingClientRect();
      if (!el || sr.width < 8) return { x: 24, y: 36 };
      const tr = el.getBoundingClientRect();
      const x = tr.left - sr.left + Math.min(22, tr.width * 0.18);
      const y = tr.top - sr.top + Math.min(28, Math.max(10, tr.height * 0.28));
      return {
        x: Math.max(4, Math.min(sr.width - 34, x)),
        y: Math.max(8, Math.min(sr.height - 36, y)),
      };
    };

    const emblemPoint = () => {
      const sr = stage.getBoundingClientRect();
      const el = emblem;
      if (!el || sr.width < 8) return { x: sr.width / 2, y: sr.height * 0.34 };
      const tr = el.getBoundingClientRect();
      return { x: tr.left - sr.left + tr.width / 2, y: tr.top - sr.top + tr.height / 2 };
    };

    const clearHot = () => {
      stage.querySelectorAll<HTMLElement>("[data-hot]").forEach((node) => node.removeAttribute("data-hot"));
    };

    const drawWire = (id: string) => {
      if (!wire || stage.getBoundingClientRect().width < 768) {
        if (wire) wire.setAttribute("d", "");
        if (pulse) pulse.setAttribute("opacity", "0");
        return;
      }
      const from = emblemPoint();
      const el = targetEl(id);
      const sr = stage.getBoundingClientRect();
      if (!el) return;
      const tr = el.getBoundingClientRect();
      const to = {
        x: tr.left - sr.left + tr.width / 2,
        y: tr.top - sr.top + tr.height / 2,
      };
      const midX = (from.x + to.x) / 2;
      wire.setAttribute("d", `M ${from.x} ${from.y} Q ${midX} ${from.y} ${to.x} ${to.y}`);
      const length = wire.getTotalLength();
      wire.style.strokeDasharray = `${length}`;
      wire.style.strokeDashoffset = "0";
      if (pulse && length > 1) {
        const point = wire.getPointAtLength(length * 0.72);
        pulse.setAttribute("cx", String(point.x));
        pulse.setAttribute("cy", String(point.y));
        pulse.setAttribute("opacity", "1");
      }
    };

    const ctx = gsap.context(() => {
      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(cards, { autoAlpha: 0, y: 10 });
      gsap.set(emblem, { autoAlpha: 0, scale: 0.9 });
      gsap.set(cursor, { autoAlpha: 0, x: 18, y: 28 });
      gsap.set(ripple, { autoAlpha: 0, scale: 0.4 });
      gsap.set(bars, { scaleY: 0, transformOrigin: "center bottom" });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      if (sweep) gsap.set(sweep, { autoAlpha: 0, xPercent: -20 });

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.45,
        defaults: { ease: "power2.out" },
      });

      tl.to(emblem, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0);
      if (halo) tl.to(halo, { autoAlpha: 1, duration: 0.5 }, 0);
      if (sweep) tl.to(sweep, { autoAlpha: 0.45, xPercent: 160, duration: BEAT * SCENES.length, ease: "none" }, 0);
      if (progress) tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: BEAT * SCENES.length, ease: "none" }, 0);

      const visit = (id: string, at: number) => {
        tl.to(cursor, {
          autoAlpha: 1,
          x: () => tip(id).x,
          y: () => tip(id).y,
          duration: 0.48,
          ease: "power3.inOut",
          onUpdate: () => drawWire(id),
        }, at);
        tl.call(() => {
          clearHot();
          targetEl(id)?.setAttribute("data-hot", "true");
          drawWire(id);
        }, undefined, at + 0.46);
        tl.fromTo(ripple, { autoAlpha: 0.9, scale: 0.35 }, { autoAlpha: 0, scale: 1.8, duration: 0.32, ease: "power2.out" }, at + 0.46);
      };

      scenes.forEach((scene, index) => {
        if (!scene) return;
        const start = index * BEAT;
        const sceneCards = scene.querySelectorAll<HTMLElement>("[data-cine='card']");
        tl.call(() => setSceneIndex(index), undefined, start);
        tl.to(scene, { autoAlpha: 1, duration: 0.35 }, start);
        tl.to(sceneCards, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, start + 0.08);
        if (index === 6) {
          tl.to(bars, { scaleY: 1, duration: 0.45, stagger: 0.04, ease: "power2.out" }, start + 2.05);
        }
        MOVES[index]?.forEach((move) => visit(move.id, start + move.at));
        tl.call(() => clearHot(), undefined, start + BEAT - 0.4);
        tl.to(scene, { autoAlpha: 0, duration: 0.3 }, start + BEAT - 0.32);
        tl.set(sceneCards, { autoAlpha: 0, y: 10 }, start + BEAT - 0.02);
        tl.set(cursor, { autoAlpha: 0.2 }, start + BEAT - 0.2);
      });

      if (halo) {
        gsap.to(halo, { scale: 1.06, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
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
        inView.current = !!entry?.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.35 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", syncPlayback);
    const onResize = () => {
      const hot = stage.querySelector<HTMLElement>("[data-hot]");
      const id = hot?.getAttribute("data-target");
      if (id && cursor) {
        const next = tip(id);
        gsap.set(cursor, { x: next.x, y: next.y });
        drawWire(id);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("resize", onResize);
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
    tl.restart();
    if (!inView.current || document.visibilityState !== "visible") tl.pause();
  };

  const active = SCENES[sceneIndex] ?? SCENES[0];

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
        className="cine-stage relative mx-auto aspect-[4/5] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)] max-md:aspect-auto max-md:h-[40rem] md:aspect-video md:h-auto"
      >
        <div className="cine-grid absolute inset-0" aria-hidden="true" />
        <div className="cine-glow absolute inset-0" aria-hidden="true" />
        <div data-cine="sweep" className="cine-sweep" aria-hidden="true" />
        <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
          <path data-cine="wire" fill="none" stroke="rgba(110,231,183,0.8)" strokeWidth="1.4" strokeLinecap="round" />
          <circle data-cine="pulse" r="3.2" fill="#d1fae5" opacity="0" />
        </svg>
        <div data-cine="halo" className="cine-halo" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-[11%] z-[1] -translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
          <div data-cine="emblem" data-target="emblem">
            <AbosMark glow className="h-14 w-auto sm:h-20 md:h-28" title="" />
          </div>
        </div>

        {reduced ? (
          <Poster />
        ) : (
          <>
            <SceneFrame index={0}>
              <Card target="s0-enquiry" kicker="WhatsApp" title="New enquiry" detail="Hi, is this available in black? Can you deliver to Ikeja?" />
              <Card target="s0-customer" kicker="Customer" title="Adaeze Okafor" detail="Conversation stays attached to this customer." className="hidden sm:block" />
              <Card target="s0-context" kicker="Context" title="Signal captured" detail="ABOS keeps the person on the thread. Nothing is confirmed yet." status="Enquiry received" />
            </SceneFrame>
            <SceneFrame index={1}>
              <Card target="s1-profile" kicker="Profile" title="Customer 360" detail="Prior thread: asked about the same item last week." />
              <Card target="s1-catalogue" kicker="Catalogue" title="Matching product" detail="Black variant is the record on file. Availability is not assumed." />
              <Card target="s1-next" kicker="Next action" title="Check, then answer" detail="Intent is product plus Ikeja delivery. A person still confirms both." className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={2}>
              <Card target="s2-reply" kicker="Grounded reply" title="Suggested response" detail="I found the matching catalogue item. I'm checking current availability and delivery options before I confirm." />
              <Card target="s2-sources" kicker="Sources" title="Saved business information" detail="Customer context, catalogue, approved knowledge, and operating rules." status="Not invented" />
              <Card target="s2-boundary" kicker="Boundary" title="No guessed promises" detail="Stock, price, policy, and delivery are not filled in by the model." className="hidden md:block" />
            </SceneFrame>
            <SceneFrame index={3}>
              <Card target="s3-stock" kicker="Product match" title="Black variant" detail="The catalogue row is linked. Stock is still a check." status="Stock check required" />
              <Card target="s3-draft" kicker="Order" title="Draft only" detail="The request can sit as a draft. It is not a confirmed order." status="Order draft" />
              <Card target="s3-life" kicker="Lifecycle" title="Awaiting confirmation" detail="Nothing moves to confirmed until an authorised step says so." status="Awaiting confirmation" className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={4}>
              <Card target="s4-claim" kicker="Payment" title="Transfer claim" detail="A customer says they sent money. That claim is not settlement." tone="amber" status="Transfer claim — pending verification" />
              <Card target="s4-review" kicker="Human review" title="Held for an authorised person" detail="Manual transfers stay pending until someone authorised verifies them." tone="amber" status="Not settled" />
              <Card target="s4-boundary" kicker="Boundary" title="No false success" detail="A screenshot does not flip this record to paid." tone="amber" className="hidden md:block" />
            </SceneFrame>
            <SceneFrame index={5}>
              <Card target="s5-delivery" kicker="Delivery" title="Preparation" detail="Handoff is required. No delivery time is promised." status="Delivery not confirmed" />
              <Card target="s5-task" kicker="Task" title="Assigned follow-up" detail="An owner or agent can take the next step. It does not run itself." status="Task assigned" />
              <Card target="s5-team" kicker="Team" title="Role gate" detail="Escalation stays with someone who is allowed to act." status="Handoff required" className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={6} dense>
              <Card target="s6-customers" className="cine-compact" kicker="Customers" title="Conversations" detail="The thread remains the source of the request." />
              <Card target="s6-knowledge" className="cine-compact" kicker="Knowledge" title="Rules on file" detail="Approved knowledge is what the reply may use." />
              <Card target="s6-commerce" className="cine-compact" kicker="Commerce" title="Products, orders, payments" detail="Catalogue, draft order, and unverified transfer stay distinct." />
              <Card target="s6-ops" className="cine-compact" kicker="Operations" title="Delivery, tasks, team" detail="Handoff, assignment, and permissions sit on one surface." />
              <div data-cine="card" data-target="s6-analytics" className="cine-glass cine-inline cine-compact">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-signal">Analytics</p>
                <p className="mt-1 font-display text-sm font-semibold text-harmattan">Operating picture</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber">Illustrative demo data</p>
                <MiniChart />
              </div>
              <div data-cine="card" data-target="s6-finale" className="cine-glass cine-inline cine-compact">
                <p className="font-display text-sm font-semibold leading-snug text-harmattan md:text-base">One business. One connected intelligence.</p>
                <p className="mt-1 text-[11px] leading-snug text-harmattan-muted">Customers, knowledge, commerce, delivery, team, tasks, and analytics on one system.</p>
              </div>
            </SceneFrame>
            <Pointer />
          </>
        )}

        <p className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-harmattan-muted">
          Illustrative product preview
        </p>

        {reduced ? null : (
          <>
            <p className="absolute right-3 top-3 z-[4] rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-harmattan">
              <span className="sr-only">Scene </span>
              {active.id} / 07 — {active.name}
            </p>
            <div className="absolute inset-x-0 bottom-14 z-[4] flex justify-center gap-1.5 px-4" aria-hidden="true">
              {SCENES.map((item, index) => (
                <span
                  key={item.id}
                  className={cn("h-1 flex-1 max-w-10 rounded-full", index <= sceneIndex ? "bg-signal" : "bg-white/15")}
                />
              ))}
            </div>
            <div data-cine="progress" className="absolute inset-x-0 bottom-0 z-[3] h-[2px] origin-left bg-signal/80" aria-hidden="true" />
            <div className="absolute bottom-3 right-3 z-[5] flex items-center gap-2">
              <span className="sr-only" aria-live="polite">{active.name}</span>
              <button
                type="button"
                onClick={togglePause}
                aria-pressed={paused}
                aria-label={paused ? "Play product preview" : "Pause product preview"}
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 text-harmattan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ee7b7]"
              >
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
              <button
                type="button"
                onClick={replay}
                aria-label="Replay product preview"
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 text-harmattan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ee7b7]"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
