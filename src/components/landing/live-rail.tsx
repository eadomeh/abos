import { MAP_CITIES } from "@/components/landing/map-data";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EVENTS = MAP_CITIES.map((c) => ({
  id: c.id,
  avatar: c.avatar,
  person: c.person,
  place: c.name,
  line: c.snippet,
}));

export function LiveRail() {
  const reduced = usePrefersReducedMotion();
  const row = [...EVENTS, ...EVENTS];

  return (
    <div className="relative max-w-[100vw] overflow-hidden border-y border-white/[0.06] bg-onyx">
      <p className="sr-only">Live catalog-backed replies across African cities.</p>
      <div className="live-rail overflow-hidden py-3">
        <div
          className={reduced ? "flex w-max gap-8 px-6" : "live-marquee flex w-max gap-8 px-6"}
          aria-hidden="true"
        >
          {row.map((ev, i) => (
            <div key={`${ev.id}-${i}`} className="flex items-center gap-3">
              <img
                src={ev.avatar}
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-full object-cover shadow-[0_0_0_1px_rgba(246,243,236,0.12)]"
              />
              <p className="whitespace-nowrap text-sm text-harmattan-muted">
                <span className="font-medium text-harmattan">{ev.person}</span>
                <span className="text-quiet"> · {ev.place} · </span>
                {ev.line}
              </p>
              <span className="size-1.5 shrink-0 rounded-full bg-signal" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
