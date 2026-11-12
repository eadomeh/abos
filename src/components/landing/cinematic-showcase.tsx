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

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Card({
  kicker,
  title,
  detail,
  status,
  tone = "signal",
  className,
}: {
  kicker: string;
  title: string;
  detail: string;
  status?: string;
  tone?: "signal" | "amber";
  className?: string;
}) {
  return (
    <div data-cine="card" className={cn("cine-glass cine-inline", tone === "amber" && "border-amber-200/30", className)}>
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

function SceneFrame({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div data-cine="scene" data-scene={index} className="absolute inset-0 z-[2] px-3 pb-16 pt-12 md:px-6 md:pb-[4.5rem] md:pt-14">
      <div className="mx-auto grid h-full max-w-5xl grid-cols-1 content-start gap-2 overflow-hidden sm:grid-cols-2 md:grid-cols-3 md:content-center md:gap-3">
        {children}
      </div>
    </div>
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

    const ctx = gsap.context(() => {
      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(cards, { autoAlpha: 0, y: 12 });
      gsap.set(emblem, { autoAlpha: 0, scale: 0.9 });
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

      scenes.forEach((scene, index) => {
        if (!scene) return;
        const start = index * BEAT;
        const sceneCards = scene.querySelectorAll<HTMLElement>("[data-cine='card']");
        tl.call(() => setSceneIndex(index), undefined, start);
        tl.to(scene, { autoAlpha: 1, duration: 0.35 }, start);
        tl.to(sceneCards, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 }, start + 0.08);
        tl.to(scene, { autoAlpha: 0, duration: 0.3 }, start + BEAT - 0.32);
        tl.set(sceneCards, { autoAlpha: 0, y: 12 }, start + BEAT - 0.02);
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

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
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
        className="cine-stage relative mx-auto aspect-[4/5] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#05090c] shadow-[0_30px_80px_-48px_rgba(110,231,183,0.45)] md:aspect-video"
      >
        <div className="cine-grid absolute inset-0" aria-hidden="true" />
        <div className="cine-glow absolute inset-0" aria-hidden="true" />
        <div data-cine="sweep" className="cine-sweep" aria-hidden="true" />
        <div data-cine="halo" className="cine-halo" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-[18%] z-[1] -translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
          <div data-cine="emblem">
            <AbosMark glow className="h-16 w-auto sm:h-20 md:h-28" title="" />
          </div>
        </div>

        {reduced ? (
          <Poster />
        ) : (
          <>
            <SceneFrame index={0}>
              <Card kicker="WhatsApp" title="New enquiry" detail="Hi, is this available in black? Can you deliver to Ikeja?" />
              <Card kicker="Customer" title="Adaeze Okafor" detail="Conversation stays attached to this customer." className="hidden sm:block" />
              <Card kicker="Context" title="Signal captured" detail="ABOS keeps the person on the thread. Nothing is confirmed yet." status="Enquiry received" />
            </SceneFrame>
            <SceneFrame index={1}>
              <Card kicker="Profile" title="Customer 360" detail="Prior thread: asked about the same item last week." />
              <Card kicker="Catalogue" title="Matching product" detail="Black variant is the record on file. Availability is not assumed." />
              <Card kicker="Next action" title="Check, then answer" detail="Intent is product plus Ikeja delivery. A person still confirms both." className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={2}>
              <Card kicker="Grounded reply" title="Suggested response" detail="I found the matching catalogue item. I'm checking current availability and delivery options before I confirm." />
              <Card kicker="Sources" title="Saved business information" detail="Customer context, catalogue, approved knowledge, and operating rules." status="Not invented" />
              <Card kicker="Boundary" title="No guessed promises" detail="Stock, price, policy, and delivery are not filled in by the model." className="hidden md:block" />
            </SceneFrame>
            <SceneFrame index={3}>
              <Card kicker="Product match" title="Black variant" detail="The catalogue row is linked. Stock is still a check." status="Stock check required" />
              <Card kicker="Order" title="Draft only" detail="The request can sit as a draft. It is not a confirmed order." status="Order draft" />
              <Card kicker="Lifecycle" title="Awaiting confirmation" detail="Nothing moves to confirmed until an authorised step says so." status="Awaiting confirmation" className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={4}>
              <Card kicker="Payment" title="Transfer claim" detail="A customer says they sent money. That claim is not settlement." tone="amber" status="Transfer claim — pending verification" />
              <Card kicker="Human review" title="Held for an authorised person" detail="Manual transfers stay pending until someone authorised verifies them." tone="amber" status="Not settled" />
              <Card kicker="Boundary" title="No false success" detail="A screenshot does not flip this record to paid." tone="amber" className="hidden md:block" />
            </SceneFrame>
            <SceneFrame index={5}>
              <Card kicker="Delivery" title="Preparation" detail="Handoff is required. No delivery time is promised." status="Delivery not confirmed" />
              <Card kicker="Task" title="Assigned follow-up" detail="An owner or agent can take the next step. It does not run itself." status="Task assigned" />
              <Card kicker="Team" title="Role gate" detail="Escalation stays with someone who is allowed to act." status="Handoff required" className="hidden sm:block" />
            </SceneFrame>
            <SceneFrame index={6}>
              <Card kicker="Customers" title="Conversations" detail="The thread remains the source of the request." />
              <Card kicker="Knowledge" title="Rules on file" detail="Approved knowledge is what the reply may use." className="hidden sm:block" />
              <Card kicker="Commerce" title="Products, orders, payments" detail="Catalogue, draft order, and unverified transfer stay distinct." />
              <Card kicker="Operations" title="Delivery, tasks, team" detail="Handoff, assignment, and permissions sit on one surface." className="hidden md:block" />
              <Card kicker="Analytics" title="Operating picture" detail="Sample chart only. Not live ABOS activity." status="Illustrative demo data" />
              <div data-cine="card" className="cine-glass cine-inline">
                <p className="font-display text-base font-semibold text-harmattan">One business. One connected intelligence.</p>
                <p className="mt-1 text-[11px] text-harmattan-muted">Customers, knowledge, commerce, delivery, team, tasks, and analytics on one system.</p>
              </div>
            </SceneFrame>
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
