import { useEffect, useState } from "react";
import { AfricaMap } from "@/components/landing/africa-map";
import { AgentConsole } from "@/components/landing/agent-console";
import { MAP_CITIES } from "@/components/landing/map-data";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function NetworkSection() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const city = MAP_CITIES[active] ?? MAP_CITIES[0]!;

  useEffect(() => {
    if (reduced || pinned) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % MAP_CITIES.length), 4200);
    return () => window.clearInterval(id);
  }, [reduced, pinned]);

  function select(index: number) {
    setActive(index);
    setPinned(true);
  }

  return (
    <section id="network" className="scroll-mt-20 border-y border-white/[0.06] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-signal/80">The African operating network</p>
          <h2 className="mt-4 font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
            The continent is live.
            <span className="block text-quiet">The catalog is the source of truth.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
            Tap a city. Real chats fly the route — face, message, and the reply coming back. Lagos
            to Addis, same brain.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <AfricaMap reduced={reduced} activeIndex={active} pinned={pinned} onSelect={select} />

          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-charcoal p-5 sm:p-6">
              <p className="text-xs uppercase tracking-widest text-quiet">Live city</p>
              <p className="mt-2 font-display text-2xl font-semibold text-harmattan">
                {city.name}
                <span className="text-quiet"> · {city.country}</span>
              </p>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={city.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover ring-1 ring-white/10"
                />
                <div>
                  <p className="text-sm text-signal">{city.person} just answered</p>
                  <p className="text-sm leading-6 text-harmattan-muted">{city.snippet}</p>
                </div>
              </div>
            </div>

            <div className="hidden space-y-2 md:block">
              {city.threads.slice(1).map((thread) => (
                <div
                  key={`${city.id}-${thread.person}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
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
                    <p className="text-xs leading-5 text-harmattan-muted">{thread.snippet}</p>
                  </div>
                </div>
              ))}
            </div>

            <AgentConsole />

            <div className="flex flex-wrap gap-2">
              {MAP_CITIES.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => select(i)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-[background-color,border-color,color] duration-150",
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
    </section>
  );
}
