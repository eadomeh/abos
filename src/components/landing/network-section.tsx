import { useEffect, useRef, useState } from "react";
import { AfricaMap } from "@/components/landing/africa-map";
import { AgentConsole } from "@/components/landing/agent-console";
import { MAP_CITIES } from "@/components/landing/map-data";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function NetworkSection() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [awake, setAwake] = useState(true);
  const city = MAP_CITIES[active] ?? MAP_CITIES[0]!;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) return;

    let onScreen = false;
    const sync = () => setAwake(onScreen && document.visibilityState !== "hidden");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      sync();
    }, { threshold: 0.05 });

    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (reduced || pinned || !awake) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % MAP_CITIES.length), 4200);
    return () => window.clearInterval(id);
  }, [reduced, pinned, awake]);

  function select(index: number) {
    setActive(index);
    setPinned(true);
  }

  return (
    <section ref={sectionRef} id="network" className="scroll-mt-20 border-y border-white/[0.06] py-8 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl" data-scroll-reveal>
          <p className="text-xs uppercase tracking-widest text-signal/80">The African operating network</p>
          <h2 className="mt-2 font-display text-title font-semibold tracking-[-0.05em] sm:mt-4 sm:text-6xl">
            One connected African network.
            <span className="block text-quiet">The catalog is the source of truth.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-5 text-harmattan-muted sm:mt-6 sm:text-base sm:leading-7">
            Explore illustrative conversations across African cities. Each example shows how customer
            context, catalog answers and follow-up actions can share one operating layer.
          </p>
        </div>

        <div className="mt-5 grid items-start gap-4 sm:mt-14 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10" data-scroll-reveal>
          <AfricaMap reduced={reduced} activeIndex={active} pinned={pinned} onSelect={select} />

          <div className="min-w-0 space-y-3 sm:space-y-4">
            <div className="rounded-[1.25rem] border border-emerald-300/15 bg-charcoal p-3 shadow-[0_24px_60px_-36px_rgba(16,185,129,0.45)] sm:rounded-[1.6rem] sm:p-6" data-scroll-reveal-item="01">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-quiet">Selected city</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-signal/80">Illustrative sample</p>
              </div>
              <p className="mt-1 font-display text-xl font-semibold tracking-[-0.04em] text-harmattan sm:mt-2 sm:text-3xl">
                {city.name}
                <span className="text-quiet"> · {city.country}</span>
              </p>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 sm:mt-4 sm:p-3">
                <div className="flex items-start gap-3">
                  <img
                    src={city.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-signal">{city.person}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-harmattan-muted sm:line-clamp-none sm:leading-6">{city.snippet}</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-quiet sm:mt-3 sm:text-xs sm:leading-5">
                Routes drawn from this city are emphasized on the map. This is not live network coverage.
              </p>
            </div>

            <div className="space-y-2">
              {city.threads.slice(1).map((thread, index) => (
                <div
                  key={`${city.id}-${thread.person}`}
                  className={cn(
                    "items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5 sm:flex sm:p-3",
                    index === 0 ? "flex" : "hidden",
                  )}
                  data-scroll-reveal-item={String(index + 2).padStart(2, "0")}
                >
                  <img
                    src={thread.avatar}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-harmattan">{thread.person}</p>
                    <p className="line-clamp-2 text-xs leading-5 text-harmattan-muted sm:line-clamp-none">{thread.snippet}</p>
                  </div>
                </div>
              ))}
            </div>

            <AgentConsole />

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-quiet">Choose a city</p>
              <div className="flex flex-wrap gap-2">
                {MAP_CITIES.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={i === active}
                    className={cn(
                      "min-h-11 rounded-full border px-3.5 py-2 text-xs transition-[background-color,border-color,color] duration-150",
                      i === active
                        ? "border-signal/40 bg-signal/10 text-signal"
                        : "border-white/10 bg-white/[0.03] text-quiet hover:text-harmattan",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
