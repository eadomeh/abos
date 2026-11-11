import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: "signal", name: "Customer signal", copy: "An enquiry or customer message arrives." },
  { id: "context", name: "Business context", copy: "Customer, catalog and trusted knowledge connect." },
  { id: "decision", name: "Operational decision", copy: "Stock, order, payment or delivery context is checked." },
  { id: "execution", name: "Team execution", copy: "Work is prepared for the appropriate team member." },
  { id: "control", name: "Human control", copy: "Sensitive actions stay reviewable and need the right confirmation." },
] as const;

const PATH = "M 80 48 C 220 48, 260 120, 400 140 S 620 210, 500 250 S 220 320, 420 360 S 760 430, 880 460";
const ANCHOR_T = [0.09, 0.28, 0.48, 0.68, 0.88] as const;
const LABEL_OFFSET = [
  { dx: 18, dy: -28 },
  { dx: 22, dy: 22 },
  { dx: -168, dy: -30 },
  { dx: 20, dy: 24 },
  { dx: -172, dy: -28 },
] as const;

function stageFromProgress(progress: number) {
  if (progress < 0.18) return 0;
  if (progress < 0.38) return 1;
  if (progress < 0.58) return 2;
  if (progress < 0.78) return 3;
  return 4;
}

function readMotionOff() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || window.matchMedia("(max-height: 560px)").matches
    || !window.matchMedia("(min-width: 900px)").matches;
}

type Point = { x: number; y: number };

export function CinematicShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const [staticView, setStaticView] = useState(readMotionOff);
  const [stage, setStage] = useState(0);
  const [narrow, setNarrow] = useState(true);
  const [anchors, setAnchors] = useState<Point[]>([]);
  const labelId = useId();

  useEffect(() => {
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-height: 560px)"),
      window.matchMedia("(min-width: 900px)"),
      window.matchMedia("(max-width: 767px)"),
    ];
    const sync = () => {
      setStaticView(readMotionOff());
      setNarrow(queries[3]!.matches);
    };
    sync();
    queries.forEach((query) => query.addEventListener("change", sync));
    return () => queries.forEach((query) => query.removeEventListener("change", sync));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!track || !path || !marker || staticView) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const points = ANCHOR_T.map((t) => {
      const point = path.getPointAtLength(length * t);
      return { x: point.x, y: point.y };
    });
    setAnchors(points);

    const place = (progress: number) => {
      const drawn = Math.max(0, Math.min(1, progress));
      path.style.strokeDashoffset = `${length * (1 - drawn)}`;
      const distance = length * drawn;
      const point = path.getPointAtLength(distance);
      const ahead = path.getPointAtLength(Math.min(length, distance + 8));
      const behind = path.getPointAtLength(Math.max(0, distance - 8));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * (180 / Math.PI);
      marker.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
      const next = stageFromProgress(drawn);
      setStage((current) => (current === next ? current : next));
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track,
        start: "top top+=64",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => place(self.progress),
      });
    }, track);

    const resize = new ResizeObserver(() => ScrollTrigger.refresh());
    resize.observe(track);
    requestAnimationFrame(() => {
      place(0);
      ScrollTrigger.refresh();
    });

    return () => {
      resize.disconnect();
      ctx.revert();
    };
  }, [staticView]);

  function goTo(index: number) {
    setStage(index);
    const track = trackRef.current;
    if (!track || staticView) {
      document.getElementById(`cine-stop-${STAGES[index]!.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const start = track.offsetTop - 64;
    const travel = track.offsetHeight - window.innerHeight;
    const progress = (index + 0.45) / STAGES.length;
    window.scrollTo({ top: start + travel * progress, behavior: "smooth" });
  }

  const active = STAGES[stage] ?? STAGES[0];
  const desktopStory = !narrow && !staticView;

  return (
    <section id="showcase" className="relative z-10" aria-labelledby="showcase-title">
      <div ref={trackRef} className={cn("cine-track", staticView && "cine-track-static")}>
        <div className={cn(!staticView && "cine-sticky", "px-4 sm:px-8")}>
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className={cn("max-w-xl", desktopStory && "ml-[8%]")}>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">ABOS in motion</p>
                <h2 id="showcase-title" className={cn("mt-2 font-display text-title font-semibold text-harmattan", desktopStory && "cine-title-link")}>
                  One business. One connected intelligence.
                </h2>
              </div>
              <p className="max-w-sm text-xs leading-5 text-harmattan-muted">
                Illustrative product preview. Not live traffic, stock, or payment activity.
              </p>
            </div>

            {desktopStory ? (
              <svg className="cine-bridge -mt-4 h-8 w-full" viewBox="0 0 1000 32" preserveAspectRatio="none" aria-hidden="true">
                <line x1="80" y1="0" x2="80" y2="32" stroke="#6ee7b7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null}

            <div className={cn("cine-stage relative overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c]", desktopStory && "-mt-4")}>
              <div className="cine-grid absolute inset-0" aria-hidden="true" />
              <div className="cine-glow absolute inset-0" aria-hidden="true" />
              {narrow || staticView ? (
                <ol className="relative z-[2] flex flex-col gap-0 px-4 py-5">
                  {STAGES.map((item, index) => (
                    <li key={item.id} id={`cine-stop-${item.id}`} className="relative pl-8">
                      {index < STAGES.length - 1 ? (
                        <span className="absolute left-[11px] top-4 h-[calc(100%+4px)] w-px bg-signal/40" aria-hidden="true" />
                      ) : null}
                      <span className="absolute left-1.5 top-1.5 size-3 rounded-full border border-signal bg-onyx" aria-hidden="true" />
                      <p className="text-[10px] uppercase tracking-[0.16em] text-signal">0{index + 1} · {item.name}</p>
                      <p className="mb-4 mt-1 text-sm leading-6 text-harmattan-muted">{item.copy}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="relative z-[2] h-full min-h-[inherit]">
                  <svg viewBox="0 0 1000 520" className="h-full w-full" role="img" aria-labelledby={labelId}>
                    <title id={labelId}>Five-stage operating path</title>
                    <line x1="80" y1="0" x2="80" y2="48" stroke="#6ee7b7" strokeWidth="2" />
                    <path d={PATH} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
                    <path
                      ref={pathRef}
                      d={PATH}
                      fill="none"
                      stroke="#6ee7b7"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {anchors.map((point, index) => (
                      <g key={STAGES[index]!.id}>
                        {index === stage ? (
                          <line
                            x1={point.x}
                            y1={point.y}
                            x2={point.x + LABEL_OFFSET[index]!.dx}
                            y2={point.y + LABEL_OFFSET[index]!.dy}
                            stroke="rgb(248 255 252 / 0.55)"
                            strokeWidth="1"
                          />
                        ) : null}
                        {index === stage ? (
                          <circle
                            cx={point.x + LABEL_OFFSET[index]!.dx}
                            cy={point.y + LABEL_OFFSET[index]!.dy}
                            r="2.5"
                            fill="#f8fffc"
                          />
                        ) : null}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={index === stage ? 6 : 3.5}
                          fill={index === stage ? "#6ee7b7" : "#081014"}
                          stroke={index === stage ? "#f8fffc" : "rgb(110 231 183 / 0.45)"}
                          strokeWidth={index === stage ? 2 : 1.25}
                        />
                      </g>
                    ))}
                    <g ref={markerRef}>
                      <path d="M -2 -5 L 12 0 L -2 5 Z" fill="#f8fffc" stroke="#06281c" strokeWidth="0.8" />
                    </g>
                  </svg>
                  {anchors[stage] ? (
                    <p
                      key={active.id}
                      className="cine-stage-pill pointer-events-none absolute z-[3] -translate-y-1/2 rounded-full border border-white/15 bg-[#081014]/92 px-3 py-1 text-[11px] text-harmattan"
                      style={{
                        left: `${((anchors[stage].x + LABEL_OFFSET[stage]!.dx) / 1000) * 100}%`,
                        top: `${((anchors[stage].y + LABEL_OFFSET[stage]!.dy) / 520) * 100}%`,
                      }}
                    >
                      {active.name}
                    </p>
                  ) : null}
                  <p className="sr-only" aria-live="polite">
                    Stage {stage + 1} of 5. {active.name}. {active.copy}
                  </p>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#081014]/85 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-signal">{active.name}</p>
                    <p className="mt-1 text-sm text-harmattan">{active.copy}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Story stages">
              {STAGES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={index === stage}
                  onClick={() => goTo(index)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-xs",
                    index === stage ? "border-signal/50 bg-signal/15 text-harmattan" : "border-white/10 text-quiet",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
