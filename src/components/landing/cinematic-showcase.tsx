import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { AbosMark } from "@/components/landing/abos-mark";
import { cn } from "@/lib/utils";

const BEAT = 2.1;
const TRAVEL = 0.18;
const LOOP_GAP = 0.2;
const TIP_VB = { x: 44, y: 24 };
const VB = 48;
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
  [{ id: "enquiry", at: 0.3 }, { id: "context", at: 1.05 }],
  [{ id: "profile", at: 0.3 }, { id: "catalogue", at: 1.05 }],
  [{ id: "reply", at: 0.3 }, { id: "sources", at: 1.05 }],
  [{ id: "stock", at: 0.3 }, { id: "draft", at: 1.05 }],
  [{ id: "claim", at: 0.3 }, { id: "review", at: 1.05 }],
  [{ id: "task", at: 0.3 }, { id: "delivery", at: 1.05 }],
  [{ id: "customers", at: 0.12 }, { id: "commerce", at: 0.55 }, { id: "analytics", at: 0.98 }, { id: "finale", at: 1.41 }],
];

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function FloatCard({
  beat,
  target,
  slot,
  className,
  kicker,
  title,
  detail,
  status,
  tone = "signal",
  children,
}: {
  beat?: number;
  target: string;
  slot?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  className?: string;
  kicker: string;
  title: string;
  detail?: string;
  status?: string;
  tone?: "signal" | "amber";
  children?: ReactNode;
}) {
  return (
    <div
      data-cine="card"
      data-beat={beat}
      data-target={target}
      className={cn("cine-glass cine-float", slot && `cine-slot-${slot}`, tone === "amber" && "border-amber-200/35", className)}
    >
      <p className={cn("text-[9px] font-medium uppercase tracking-[0.14em] md:text-[10px]", tone === "amber" ? "text-amber" : "text-signal")}>{kicker}</p>
      <p data-cine="tap-target" className="mt-0.5 font-display text-[12px] font-semibold leading-snug text-harmattan md:text-sm">{title}</p>
      {detail ? <p className="mt-0.5 text-[11px] leading-snug text-harmattan-muted md:text-[11px]">{detail}</p> : null}
      {status ? (
        <p className={cn(
          "mt-1 inline-flex max-w-full whitespace-normal rounded-full border px-1.5 py-0.5 text-left text-[8px] uppercase leading-tight tracking-[0.08em] md:text-[10px]",
          tone === "amber" ? "border-amber-200/30 bg-amber-200/10 text-amber" : "border-white/10 bg-white/5 text-quiet",
        )}>
          {status}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function MiniChart() {
  const bars = [8, 14, 11, 18, 15, 22, 17];
  return (
    <svg data-cine="chart" viewBox="0 0 120 28" className="mt-1 h-6 w-full" aria-hidden="true">
      {bars.map((height, index) => (
        <rect
          key={index}
          data-cine="bar"
          x={4 + index * 16}
          y={26 - height}
          width="10"
          height={height}
          rx="1.5"
          fill={index === bars.length - 1 ? "#6ee7b7" : "rgba(110,231,183,0.45)"}
        />
      ))}
    </svg>
  );
}

function Pointer() {
  return (
    <div data-cine="cursor" className="cine-cursor" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
        <path d="M6 30.5 18 24 6 17.5" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 28.5 22 24 12 19.5" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 24h16" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 14.5 44 24 30 33.5c-.7.45-.2 1.55.7 1.45L34 24l-3.3-11.9c-.2-.9-1.4-1.05-1.7-.6Z" fill="#f7fff9" stroke="#04281c" strokeWidth="1.1" />
        <path d="M33 24h7.5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="44" cy="24" r="1.3" fill="#d1fae5" />
      </svg>
      <span data-cine="ripple" className="cine-ripple" />
    </div>
  );
}

function Poster() {
  return (
    <div className="absolute inset-0" data-cine-poster>
      <div className="cine-grid absolute inset-0" aria-hidden="true" />
      <div className="cine-glow absolute inset-0" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <AbosMark glow className="h-16 w-auto sm:h-24 md:h-28" title="" />
      </div>
      <FloatCard target="poster-customer" className="left-[4%] top-[16%]" kicker="Customers" title="Context held" detail="The person stays attached to the work." />
      <FloatCard target="poster-order" className="right-[4%] top-[16%] hidden sm:block" kicker="Orders" title="Draft only" detail="A request is not a confirmed order." status="Awaiting confirmation" />
      <p className="absolute inset-x-4 bottom-[18%] text-center font-display text-sm font-semibold text-harmattan md:text-lg">
        One business. One connected intelligence.
      </p>
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

    const groups = SCENES.map((_, index) => stage.querySelectorAll<HTMLElement>(`[data-beat="${index}"]`));
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
      const nodes = stage.querySelectorAll<HTMLElement>(`[data-target="${id}"]`);
      for (const el of nodes) {
        const box = el.getBoundingClientRect();
        if (box.width > 8 && box.height > 8 && el.getAttribute("data-hot-ready") !== "off") return el;
      }
      return null;
    };

    const emblemPoint = () => {
      const sr = stage.getBoundingClientRect();
      if (!emblem || sr.width < 8) return { x: sr.width / 2, y: sr.height / 2 };
      const tr = emblem.getBoundingClientRect();
      return { x: tr.left - sr.left + tr.width / 2, y: tr.top - sr.top + tr.height / 2 };
    };

    const featureTapPoint = (id: string) => {
      const card = targetEl(id);
      const title = card?.querySelector<HTMLElement>('[data-cine="tap-target"]');
      if (!card || !title) return null;
      const sr = stage.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      if (tr.width < 4 || tr.height < 4) return null;
      const left = tr.left - sr.left;
      const top = tr.top - sr.top;
      const right = left + tr.width;
      const bottom = top + tr.height;
      const from = emblemPoint();
      const edgeX = Math.min(right - 3, Math.max(left + 3, from.x));
      const edgeY = Math.min(bottom - 2, Math.max(top + 2, from.y));
      const midX = (left + right) / 2;
      const midY = (top + bottom) / 2;
      const dx = midX - edgeX;
      const dy = midY - edgeY;
      const len = Math.hypot(dx, dy) || 1;
      const step = Math.min(7, len);
      return { x: edgeX + (dx / len) * step, y: edgeY + (dy / len) * step };
    };

    const tipOrigin = `${(TIP_VB.x / VB) * 100}% ${(TIP_VB.y / VB) * 100}%`;

    const wrapperFor = (id: string) => {
      const dest = featureTapPoint(id);
      if (!dest || !cursor) return null;
      const w = cursor.clientWidth || 34;
      const h = cursor.clientHeight || 34;
      const from = emblemPoint();
      return {
        x: dest.x - w * (TIP_VB.x / VB),
        y: dest.y - h * (TIP_VB.y / VB),
        rotation: (Math.atan2(dest.y - from.y, dest.x - from.x) * 180) / Math.PI,
      };
    };

    const arrowhead = () => {
      const svg = cursor?.querySelector("svg");
      const sr = stage.getBoundingClientRect();
      const ctm = svg?.getScreenCTM();
      if (!svg || !ctm) return null;
      const point = svg.createSVGPoint();
      point.x = TIP_VB.x;
      point.y = TIP_VB.y;
      const screen = point.matrixTransform(ctm);
      return { x: screen.x - sr.left, y: screen.y - sr.top };
    };

    const emblemEdge = (tip: { x: number; y: number }) => {
      const center = emblemPoint();
      const box = emblem?.getBoundingClientRect();
      const radius = box ? Math.min(box.width, box.height) * 0.46 : 28;
      const dx = tip.x - center.x;
      const dy = tip.y - center.y;
      const len = Math.hypot(dx, dy) || 1;
      const reach = Math.min(radius, len * 0.92);
      return { x: center.x + (dx / len) * reach, y: center.y + (dy / len) * reach };
    };

    const pulseState = { t: 0 };

    const syncWire = () => {
      if (!wire) return;
      const tip = arrowhead();
      if (!tip) {
        wire.setAttribute("d", "");
        if (pulse) pulse.setAttribute("opacity", "0");
        return;
      }
      const from = emblemEdge(tip);
      const dx = tip.x - from.x;
      const dy = tip.y - from.y;
      const mx = from.x + dx * 0.5 - dy * 0.08;
      const my = from.y + dy * 0.5 + dx * 0.08;
      wire.setAttribute("d", `M ${from.x} ${from.y} Q ${mx} ${my} ${tip.x} ${tip.y}`);
      const length = wire.getTotalLength();
      if (pulse && length > 1) {
        const point = wire.getPointAtLength(Math.max(0, Math.min(1, pulseState.t)) * length);
        pulse.setAttribute("cx", String(point.x));
        pulse.setAttribute("cy", String(point.y));
        pulse.setAttribute("opacity", pulseState.t > 0.02 ? "1" : "0");
      }
    };

    const hideWire = () => {
      pulseState.t = 0;
      if (wire) wire.setAttribute("d", "");
      if (pulse) pulse.setAttribute("opacity", "0");
    };

    const clearHot = () => {
      stage.querySelectorAll<HTMLElement>("[data-hot]").forEach((node) => node.removeAttribute("data-hot"));
    };

    const ctx = gsap.context(() => {
      groups.forEach((nodes) => gsap.set(nodes, { autoAlpha: 0, y: 8 }));
      gsap.set(emblem, { autoAlpha: 0, scale: 0.88 });
      gsap.set(cursor, { autoAlpha: 0, x: 12, y: 18, rotation: 0, scale: 1, transformOrigin: tipOrigin });
      gsap.set(ripple, { autoAlpha: 0, scale: 0.4 });
      gsap.set(bars, { scaleY: 0, transformOrigin: "center bottom" });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      if (sweep) gsap.set(sweep, { autoAlpha: 0, xPercent: -30 });

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: LOOP_GAP,
        defaults: { ease: "power2.out" },
      });

      tl.to(emblem, { autoAlpha: 1, scale: 1, duration: 0.32, ease: "power3.out" }, 0.02);
      if (halo) tl.to(halo, { autoAlpha: 1, duration: 0.24 }, 0.02);
      if (sweep) tl.to(sweep, { autoAlpha: 0.4, xPercent: 180, duration: BEAT * SCENES.length, ease: "none" }, 0);
      if (progress) tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: BEAT * SCENES.length, ease: "none" }, 0);

      const visit = (id: string, at: number) => {
        const hold = (prop: "x" | "y" | "rotation") => gsap.getProperty(cursor, prop) as number;
        tl.set(pulseState, { t: 0 }, at);
        tl.to(cursor, {
          autoAlpha: 1,
          x: () => wrapperFor(id)?.x ?? hold("x"),
          y: () => wrapperFor(id)?.y ?? hold("y"),
          rotation: () => wrapperFor(id)?.rotation ?? hold("rotation"),
          scale: 1,
          transformOrigin: tipOrigin,
          duration: TRAVEL,
          ease: "power2.inOut",
          onUpdate: syncWire,
        }, at);
        tl.to(pulseState, { t: 1, duration: TRAVEL, ease: "none", onUpdate: syncWire }, at);
        tl.to(cursor, { scale: 0.86, duration: 0.06, transformOrigin: tipOrigin, ease: "power2.in" }, at + TRAVEL);
        tl.to(cursor, { scale: 1, duration: 0.1, transformOrigin: tipOrigin, ease: "power2.out" }, at + TRAVEL + 0.06);
        tl.call(() => {
          if (!featureTapPoint(id)) return;
          clearHot();
          targetEl(id)?.setAttribute("data-hot", "true");
          syncWire();
        }, undefined, at + TRAVEL);
        tl.fromTo(
          `[data-target="${id}"]`,
          { scale: 1 },
          { scale: 1.025, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "center center" },
          at + TRAVEL,
        );
        tl.fromTo(ripple, { autoAlpha: 0.95, scale: 0.35 }, { autoAlpha: 0, scale: 1.7, duration: 0.16, transformOrigin: "center center" }, at + TRAVEL);
      };

      groups.forEach((nodes, index) => {
        const start = index * BEAT;
        tl.call(() => setSceneIndex(index), undefined, start);
        tl.to(nodes, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.03 }, start + 0.05);
        if (index === 6) tl.to(bars, { scaleY: 1, duration: 0.22, stagger: 0.03 }, start + 0.9);
        MOVES[index]?.forEach((move) => visit(move.id, start + move.at));
        tl.call(() => {
          clearHot();
          hideWire();
        }, undefined, start + BEAT - 0.2);
        if (index < groups.length - 1) {
          tl.to(nodes, { autoAlpha: 0, y: 6, duration: 0.16 }, start + BEAT - 0.18);
        }
      });

      if (halo) gsap.to(halo, { scale: 1.06, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
      timelineRef.current = tl;
    }, stage);

    const syncPlayback = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      const shouldPlay = inView.current && document.visibilityState === "visible" && !userPaused.current;
      if (shouldPlay) tl.play();
      else tl.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView.current = !!entry?.isIntersecting;
      syncPlayback();
    }, { threshold: 0.35 });
    observer.observe(stage);
    document.addEventListener("visibilitychange", syncPlayback);
    const onResize = () => {
      const hot = stage.querySelector<HTMLElement>("[data-hot]");
      const id = hot?.getAttribute("data-target");
      if (id && cursor) {
        const next = wrapperFor(id);
        if (!next) return;
        gsap.set(cursor, { x: next.x, y: next.y, rotation: next.rotation, transformOrigin: tipOrigin });
        syncWire();
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
    <section id="showcase" className="relative z-10 mx-auto max-w-[1440px] px-4 py-4 sm:px-8 sm:py-10" aria-labelledby="showcase-title">
      <div className="mx-auto mb-3 max-w-3xl text-center sm:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">ABOS in motion</p>
        <h2 id="showcase-title" className="mt-2 font-display text-title font-semibold text-harmattan sm:mt-3">
          One business. One connected intelligence.
        </h2>
        <p className="mt-2 text-sm text-harmattan-muted sm:mt-3 sm:text-base">
          Illustrative product preview. Not live traffic, stock, or payment activity.
        </p>
      </div>

      <div
        ref={stageRef}
        className="cine-stage cine-stage-frame relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)]"
      >
        <div className="cine-grid absolute inset-0" aria-hidden="true" />
        <div className="cine-glow absolute inset-0" aria-hidden="true" />
        <div data-cine="sweep" className="cine-sweep" aria-hidden="true" />
        <svg className="cine-wire pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
          <path data-cine="wire" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" />
          <circle data-cine="pulse" r="3.5" fill="#ecfdf5" opacity="0" />
        </svg>
        <div data-cine="halo" className="cine-halo" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-[46%] z-[2] -translate-x-1/2 -translate-y-1/2">
          <div data-cine="emblem" data-target="emblem">
            <AbosMark glow className="h-12 w-auto sm:h-20 md:h-28" title="" />
          </div>
        </div>

        {reduced ? <Poster /> : (
          <>
            <FloatCard beat={0} target="enquiry" slot="nw" kicker="WhatsApp" title="New enquiry" detail="Hi, is this available in black? Can you deliver to Ikeja?" />
            <FloatCard beat={0} target="context" slot="se" kicker="Context" title="Signal captured" detail="The person stays on the thread. Nothing is confirmed yet." status="Enquiry received" />

            <FloatCard beat={1} target="profile" slot="n" kicker="Profile" title="Customer 360" detail="Prior thread: asked about the same item last week." />
            <FloatCard beat={1} target="catalogue" slot="sw" kicker="Catalogue" title="Matching product" detail="Black variant is the record on file. Availability is not assumed." />

            <FloatCard beat={2} target="reply" slot="e" kicker="Grounded reply" title="Suggested response" detail="I found the matching catalogue item. I'm checking availability and delivery before I confirm." />
            <FloatCard beat={2} target="sources" slot="nw" kicker="Sources" title="Saved business information" detail="Customer context, catalogue, approved knowledge, and rules." status="Not invented" />

            <FloatCard beat={3} target="stock" slot="ne" kicker="Product match" title="Black variant" detail="The catalogue row is linked. Stock is still a check." status="Stock check required" />
            <FloatCard beat={3} target="draft" slot="s" kicker="Order" title="Draft only" detail="The request can sit as a draft. It is not a confirmed order." status="Order draft" />

            <FloatCard beat={4} target="claim" slot="w" tone="amber" kicker="Payment" title="Transfer claim" detail="A customer says they sent money. That claim is not settlement." status="Transfer claim — pending verification" />
            <FloatCard beat={4} target="review" slot="se" tone="amber" kicker="Human review" title="Held for an authorised person" detail="Manual transfers stay pending until someone authorised verifies them." status="Not settled" />

            <FloatCard beat={5} target="task" slot="sw" kicker="Task" title="Assigned follow-up" detail="An owner or agent can take the next step. It does not run itself." status="Task assigned" />
            <FloatCard beat={5} target="delivery" slot="n" kicker="Delivery" title="Preparation" detail="Handoff is required. No delivery time is promised." status="Delivery not confirmed" />

            <FloatCard beat={6} target="customers" slot="nw" kicker="Customers" title="Conversations" detail="The thread remains the source of the request." />
            <FloatCard beat={6} target="commerce" slot="ne" kicker="Commerce" title="Products, orders, payments" detail="Catalogue, draft order, and unverified transfer stay distinct." />
            <FloatCard beat={6} target="analytics" slot="sw" kicker="Analytics" title="Operating picture" status="Illustrative demo data">
              <MiniChart />
            </FloatCard>
            <FloatCard beat={6} target="finale" slot="se" kicker="ABOS" title="One business. One connected intelligence." detail="Knowledge, delivery, team, and tasks share this system." />
            <Pointer />
          </>
        )}

        <p className="pointer-events-none absolute left-1/2 top-2 z-[4] max-w-[92%] -translate-x-1/2 truncate rounded-full border border-white/10 bg-black/55 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-harmattan md:text-[10px]">
          {reduced ? "Illustrative still" : `${active.id} / 07 · ${active.name}`}
        </p>
        {reduced ? null : (
          <>
            <div data-cine="progress" className="absolute inset-x-0 bottom-0 z-[3] h-[2px] origin-left bg-signal/80" />
            <div className="cine-dock absolute bottom-2 left-1/2 z-[5] flex -translate-x-1/2 gap-1.5">
              <button type="button" onClick={togglePause} aria-pressed={paused} aria-label={paused ? "Play product preview" : "Pause product preview"} className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/60 text-harmattan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ee7b7] md:size-10">
                {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              </button>
              <button type="button" onClick={replay} aria-label="Replay product preview" className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/60 text-harmattan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ee7b7] md:size-10">
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
