import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AbosMark } from "@/components/landing/abos-mark";
import { cn } from "@/lib/utils";

const DURATION = 20.4;

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function GlassCard({
  cine,
  className,
  kicker,
  title,
  detail,
}: {
  cine: string;
  className?: string;
  kicker: string;
  title: string;
  detail: string;
}) {
  return (
    <div data-cine={cine} className={cn("cine-glass", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-signal">{kicker}</p>
      <p className="mt-1 font-display text-sm font-semibold tracking-normal text-harmattan md:text-base">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-harmattan-muted md:text-xs">{detail}</p>
    </div>
  );
}

function Poster() {
  return (
    <div className="absolute inset-0" data-cine-poster>
      <div className="cine-grid absolute inset-0" aria-hidden="true" />
      <div className="cine-glow absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <AbosMark glow className="h-28 w-auto sm:h-36" title="" />
        <p className="mt-5 max-w-md font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl">
          African business intelligence. Connected operations. Real execution.
        </p>
      </div>
      <GlassCard
        cine="poster-customers"
        className="left-[6%] top-[10%] w-[42%] max-w-[220px] md:w-[200px]"
        kicker="Customers"
        title="Context held"
        detail="Who they are stays attached to the work."
      />
      <GlassCard
        cine="poster-orders"
        className="right-[6%] top-[14%] hidden w-[200px] sm:block"
        kicker="Orders"
        title="Work in view"
        detail="Requests sit with the operation, not in a side chat."
      />
      <div className="cine-glass bottom-[8%] left-1/2 w-[min(92%,320px)] -translate-x-1/2 border-amber-200/20">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber">Human control</p>
        <p className="mt-1 font-display text-sm font-semibold text-harmattan">Held for review</p>
        <p className="mt-1 text-[11px] leading-snug text-harmattan-muted">Nothing sensitive executes before someone authorised approves it.</p>
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
  const [scene, setScene] = useState("Illustrative preview");

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

    const setSceneNow = (label: string) => {
      setScene(label);
    };

    const ctx = gsap.context(() => {
      const messages = q("message");
      const paths = q("path");
      const nodes = q("node");
      const panels = q("panel");
      const links = q("link");
      const ops = q("ops");
      const emblem = one("emblem");
      const emblemHalo = one("halo");
      const approval = one("approval");
      const statement = one("statement");
      const sweep = one("sweep");
      const progress = one("progress");

      gsap.set(paths, { scaleX: 0, transformOrigin: "left center" });
      gsap.set([messages, paths, nodes, panels, links, ops, emblem, emblemHalo, approval, statement, sweep], {
        autoAlpha: 0,
      });
      gsap.set(messages, { y: 16 });
      gsap.set(panels, { y: 20, scale: 0.98 });
      gsap.set(ops, { y: 22, scale: 0.98 });
      gsap.set(emblem, { scale: 0.86 });
      gsap.set(approval, { y: 16 });
      gsap.set(statement, { y: 12 });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.8,
        defaults: { ease: "power2.out" },
      });

      tl.call(() => setSceneNow("Signal arrives"), undefined, 0);
      tl.to(sweep, { autoAlpha: 0.5, xPercent: 140, duration: 2.6, ease: "power1.inOut" }, 0.1);
      tl.to(messages, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18 }, 0.2);
      tl.to(paths, { autoAlpha: 0.8, scaleX: 1, duration: 0.9, stagger: 0.12 }, 0.65);
      tl.to(nodes, { autoAlpha: 1, duration: 0.35, stagger: 0.08 }, 0.85);
      tl.to(messages, { autoAlpha: 0.4, duration: 0.55 }, 3.4);

      tl.call(() => setSceneNow("Business brain"), undefined, 4);
      tl.to(emblemHalo, { autoAlpha: 1, duration: 0.55 }, 4);
      tl.to(emblem, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out" }, 4.05);
      tl.to(panels, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12 }, 4.4);
      tl.to(links, { autoAlpha: 0.85, duration: 0.4, stagger: 0.1 }, 5.25);
      tl.to([messages, paths], { autoAlpha: 0, duration: 0.4 }, 7.5);

      tl.call(() => setSceneNow("Operations connect"), undefined, 8);
      tl.to(ops, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 }, 8.05);
      tl.to(panels, { autoAlpha: 0.5, duration: 0.45 }, 8.4);
      tl.to(links, { autoAlpha: 1, duration: 0.35 }, 9.2);
      tl.to(links, { autoAlpha: 0.35, duration: 0.35 }, 9.7);
      tl.to(links, { autoAlpha: 0.9, duration: 0.35 }, 10.2);

      tl.call(() => setSceneNow("Human control"), undefined, 12.4);
      tl.to(approval, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" }, 12.45);
      tl.to([ops, panels], { autoAlpha: 0.28, duration: 0.45 }, 12.7);

      tl.call(() => setSceneNow("Connected future"), undefined, 16.2);
      tl.to([panels, ops, links, nodes, approval, emblemHalo, paths], { autoAlpha: 0, duration: 0.65 }, 16.25);
      tl.to(emblem, { scale: 1.05, duration: 0.7, ease: "power2.inOut" }, 16.45);
      tl.to(statement, { autoAlpha: 1, y: 0, duration: 0.65 }, 17.1);
      if (progress) {
        tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: "none" }, 0);
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

    const onVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
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
        className="cine-stage relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)] aspect-[4/5] md:aspect-video"
      >
        <div className="cine-grid absolute inset-0" aria-hidden="true" />
        <div className="cine-glow absolute inset-0" aria-hidden="true" />
        <div data-cine="sweep" className="cine-sweep" aria-hidden="true" />
        <span data-cine="node" className="cine-node left-[18%] top-[22%]" aria-hidden="true" />
        <span data-cine="node" className="cine-node left-[72%] top-[28%] hidden md:block" aria-hidden="true" />
        <span data-cine="node" className="cine-node left-[30%] top-[70%]" aria-hidden="true" />
        <span data-cine="path" className="cine-path left-[12%] top-[30%] w-[28%] origin-left" aria-hidden="true" />
        <span data-cine="path" className="cine-path right-[10%] top-[36%] hidden w-[24%] origin-right md:block" aria-hidden="true" />
        <span data-cine="path" className="cine-path bottom-[24%] left-[22%] w-[30%] origin-left" aria-hidden="true" />

        {reduced ? (
          <Poster />
        ) : (
          <>
            <div data-cine="message" className="cine-glass left-[5%] top-[8%] w-[46%] max-w-[230px] md:left-[7%] md:top-[12%] md:w-[220px]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative message</p>
              <p className="mt-1 text-xs leading-snug text-harmattan md:text-sm">Can you still help me with this order?</p>
            </div>
            <div data-cine="message" className="cine-glass right-[5%] top-[12%] w-[46%] max-w-[230px] md:right-[8%] md:top-[16%] md:w-[220px]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative message</p>
              <p className="mt-1 text-xs leading-snug text-harmattan md:text-sm">Is delivery open this week?</p>
            </div>
            <div className="absolute left-1/2 top-[8%] hidden -translate-x-1/2 md:block">
              <div data-cine="message" className="cine-glass cine-inline w-[260px]">
                <p className="text-[10px] uppercase tracking-[0.16em] text-quiet">Illustrative message</p>
                <p className="mt-1 text-sm leading-snug text-harmattan">Do you have this in another colour?</p>
              </div>
            </div>

            <div data-cine="halo" className="cine-halo" aria-hidden="true" />
            <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 md:top-[44%]">
              <div data-cine="emblem">
                <AbosMark glow className="h-24 w-auto sm:h-28 md:h-40" title="" />
              </div>
            </div>

            <GlassCard cine="panel" className="left-[4%] top-[50%] w-[46%] max-w-[220px] md:left-[5%] md:top-[22%] md:w-[210px]" kicker="Customers" title="Shared context" detail="The person stays attached to the thread." />
            <GlassCard cine="panel" className="right-[4%] top-[50%] w-[46%] max-w-[220px] md:right-[5%] md:top-[22%] md:w-[210px]" kicker="Products" title="What they mean" detail="The offer stays next to the question." />
            <GlassCard cine="panel" className="bottom-[18%] left-[5%] hidden w-[210px] md:bottom-[30%] md:block" kicker="Orders" title="The work" detail="A request becomes an operation." />
            <GlassCard cine="panel" className="bottom-[18%] right-[5%] hidden w-[210px] md:bottom-[30%] md:block" kicker="Knowledge" title="What ABOS knows" detail="Prior context is available, not guessed." />

            <span data-cine="link" className="cine-link left-[27%] top-[32%] hidden w-[16%] md:block" aria-hidden="true" />
            <span data-cine="link" className="cine-link right-[27%] top-[32%] hidden w-[16%] md:block" aria-hidden="true" />

            <GlassCard cine="ops" className="bottom-[7%] left-[4%] w-[46%] max-w-[230px] md:bottom-[7%] md:left-[5%] md:top-auto md:w-[230px]" kicker="Workflow" title="Route the conversation" detail="The thread joins the operating view." />
            <div className="absolute bottom-[7%] left-1/2 hidden -translate-x-1/2 md:block">
              <GlassCard cine="ops" className="cine-inline w-[250px]" kicker="Operations" title="One working surface" detail="Customer context and the task stay together." />
            </div>
            <GlassCard cine="ops" className="bottom-[7%] right-[4%] w-[46%] max-w-[230px] md:hidden" kicker="Operations" title="One working surface" detail="Customer context and the task stay together." />
            <div className="absolute bottom-[7%] right-[5%] hidden md:block">
              <GlassCard cine="ops" className="cine-inline w-[230px]" kicker="Review" title="Check before action" detail="Sensitive steps wait. They do not auto-complete." />
            </div>

            <div className="absolute left-1/2 top-[16%] w-[min(88%,340px)] -translate-x-1/2 md:top-[12%]">
              <div data-cine="approval" className="cine-glass cine-inline border-amber-200/25">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber">Human control</p>
              <p className="mt-1 font-display text-base font-semibold text-harmattan">Awaiting approval</p>
              <p className="mt-1 text-xs leading-snug text-harmattan-muted">
                A sensitive action is held. It has not been executed.
              </p>
              <p className="mt-3 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber">
                Not executed
              </p>
              </div>
            </div>

            <div data-cine="statement" className="absolute inset-x-0 bottom-[12%] px-6 text-center md:bottom-[16%]">
              <p className="mx-auto max-w-xl font-display text-lg font-semibold leading-snug text-harmattan sm:text-2xl md:text-[1.85rem]">
                African business intelligence. Connected operations. Real execution.
              </p>
            </div>

            <div data-cine="progress" className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-signal/70" aria-hidden="true" />
          </>
        )}

        <p className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-harmattan-muted">
          Illustrative product preview
        </p>

        {reduced ? null : (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="sr-only" aria-live="polite">
              {scene}
            </span>
            <span className="hidden rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-quiet sm:inline" aria-hidden="true">
              {scene}
            </span>
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Play product preview" : "Pause product preview"}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 text-harmattan"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay product preview"
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 text-harmattan"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
