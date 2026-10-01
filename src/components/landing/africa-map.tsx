import {
  AFRICA_RING,
  MADAGASCAR_RING,
  MAP_ARCS,
  MAP_CITIES,
  type MapThread,
  arcPath,
  cityById,
  lonLatToPct,
  lonLatToSvg,
  ringToSvgPath,
} from "@/components/landing/map-data";
import { MapFlights } from "@/components/landing/map-flights";
import { cn } from "@/lib/utils";

type Props = {
  reduced?: boolean;
  activeIndex: number;
  pinned?: boolean;
  onSelect?: (index: number) => void;
};

function Packet({ d, delay, color }: { d: string; delay: number; color: string }) {
  return (
    <circle r="2.4" fill={color} opacity="0.95">
      <animateMotion dur="5.2s" begin={`${delay}s`} repeatCount="indefinite" path={d} />
    </circle>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function ChatChip({ thread, place, country }: { thread: MapThread; place: string; country: string }) {
  return (
    <article className="w-full rounded-2xl bg-charcoal/95 p-3 shadow-[0_0_0_1px_rgba(246,243,236,0.1),0_18px_40px_-22px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <img
          src={thread.avatar}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover ring-1 ring-white/15"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-sans text-sm font-medium text-harmattan">{thread.person}</p>
            <span className="size-2 shrink-0 rounded-full bg-signal" />
          </div>
          <p className="truncate text-xs text-quiet">
            {place}, {country}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-harmattan-muted">{thread.snippet}</p>
    </article>
  );
}

function CompactChip({ thread, place }: { thread: MapThread; place: string }) {
  return (
    <article className="flex items-center gap-2.5 rounded-2xl bg-charcoal/95 px-2.5 py-2 shadow-[0_0_0_1px_rgba(246,243,236,0.1),0_14px_32px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm">
      <img
        src={thread.avatar}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full object-cover ring-1 ring-white/15"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-harmattan">
          {thread.person}
          <span className="text-quiet"> · {place}</span>
        </p>
        <p className="truncate text-xs leading-5 text-harmattan-muted">{thread.snippet}</p>
      </div>
      <span className="size-2 shrink-0 rounded-full bg-signal" />
    </article>
  );
}

export function AfricaMap({ reduced = false, activeIndex, pinned = false, onSelect }: Props) {
  const city = MAP_CITIES[activeIndex] ?? MAP_CITIES[0]!;
  const pos = lonLatToPct(city.lon, city.lat);
  const featured = city.threads[0]!;
  const popupLeft = pos.x < 52;
  const popupX = clamp(popupLeft ? pos.x + 6 : pos.x - 38, 3, 58);
  const popupY = clamp(pos.y - 18, 6, 48);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "map-stage relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-charcoal/40",
          !reduced && "map-idle",
        )}
      >
        <svg
          viewBox="0 0 200 240"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="map-fill" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="rgba(110,231,183,0.48)" />
              <stop offset="42%" stopColor="rgba(16,48,40,0.92)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0.28)" />
            </radialGradient>
            <linearGradient id="map-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="map-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="map-grid" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(248,255,252,0.045)" strokeWidth="0.4" />
            </pattern>
          </defs>

          <rect width="200" height="240" fill="url(#map-grid)" />
          <ellipse cx="98" cy="214" rx="62" ry="8" fill="rgba(110,231,183,0.08)" />

          <path
            d={ringToSvgPath(AFRICA_RING)}
            fill="url(#map-fill)"
            stroke="url(#map-stroke)"
            strokeWidth="1.7"
            filter="url(#map-glow)"
          />
          <path
            d={ringToSvgPath(MADAGASCAR_RING)}
            fill="url(#map-fill)"
            stroke="url(#map-stroke)"
            strokeWidth="1.2"
          />

          {MAP_ARCS.map(([fromId, toId], i) => {
            const from = cityById(fromId);
            const to = cityById(toId);
            if (!from || !to) return null;
            const d = arcPath(from, to);
            const live = fromId === city.id || toId === city.id;
            return (
              <g key={`${fromId}-${toId}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={live ? "#6ee7b7" : "rgba(110,231,183,0.28)"}
                  strokeWidth={live ? 1.15 : 0.55}
                  strokeDasharray="2.4 2.8"
                  className={cn(!reduced && "map-arc")}
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
                {reduced ? null : <Packet d={d} delay={i * 0.55} color={live ? "#fbbf24" : "#6ee7b7"} />}
              </g>
            );
          })}

          {MAP_CITIES.map((c, i) => {
            const { x, y } = lonLatToSvg(c.lon, c.lat);
            const on = i === activeIndex;
            return (
              <g key={c.id} transform={`translate(${x} ${y})`}>
                {on ? (
                  <>
                    <circle r="10" fill="none" stroke="#6ee7b7" strokeWidth="0.55" className="map-radar" />
                    <circle
                      r="10"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.35"
                      className="map-radar"
                      style={{ animationDelay: "0.7s" }}
                    />
                  </>
                ) : null}
                <circle
                  r={on ? 3.8 : 2.15}
                  fill={on ? "#fbbf24" : "#6ee7b7"}
                  filter={on ? "url(#map-glow)" : undefined}
                  className={cn(!reduced && !on && "map-marker-pulse")}
                  style={{ animationDelay: `${c.delay}s` }}
                />
              </g>
            );
          })}
        </svg>

        <MapFlights reduced={reduced} />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-onyx/80 px-2.5 py-1 ring-1 ring-white/10">
          <span className="size-1.5 rounded-full bg-signal" />
          <p className="text-[10px] font-medium uppercase tracking-widest text-signal">Live messages</p>
        </div>

        {reduced ? null : <div className="map-scan pointer-events-none absolute inset-x-[12%] top-[8%] hidden h-px md:block" />}

        <div
          className={cn(
            "pointer-events-none absolute z-20 hidden w-[12.5rem] md:block",
            !pinned && "map-chip",
          )}
          style={{ left: `${popupX}%`, top: `${popupY}%` }}
        >
          <ChatChip thread={featured} place={city.name} country={city.country} />
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 md:hidden">
          <CompactChip thread={featured} place={city.name} />
        </div>

        {onSelect
          ? MAP_CITIES.map((c, i) => {
              const p = lonLatToPct(c.lon, c.lat);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`${c.name}, ${c.country}`}
                  onClick={() => onSelect(i)}
                  className="absolute z-30 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}
