import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Stat = {
  id: string;
  target: number;
  label: string;
};

const STATS: Stat[] = [
  { id: "conversations", target: 128, label: "conversations answered today" },
  { id: "cities", target: 6, label: "cities live" },
  { id: "invented", target: 0, label: "prices invented" },
];

function useCountUp(target: number, reduced: boolean, durationMs = 1400) {
  const [value, setValue] = useState(reduced ? target : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reduced || started.current) return;
    started.current = true;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, target, durationMs]);

  return value;
}

function StatItem({ stat, reduced }: { stat: Stat; reduced: boolean }) {
  const value = useCountUp(stat.target, reduced);
  return (
    <div className="min-w-[9rem]">
      <p className="font-display text-3xl font-semibold text-signal md:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-quiet">{stat.label}</p>
    </div>
  );
}

export function LiveStats() {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="border-b border-harmattan/8 bg-onyx px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline gap-x-12 gap-y-4">
        {STATS.map((stat) => (
          <StatItem key={stat.id} stat={stat} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}
