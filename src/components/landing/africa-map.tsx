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
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  reduced?: boolean;
  activeIndex: number;
  pinned?: boolean;
  onSelect?: (index: number) => void;
};

const SPARSE_LABELS = new Set(["dakar", "accra", "kano", "nairobi", "addis"]);

const LABEL_NUDGE: Record<string, { dx: number; dy: number; anchor: "start" | "end" }> = {
  dakar: { dx: -4.5, dy: -1.2, anchor: "end" },
  accra: { dx: -4.2, dy: 3.4, anchor: "end" },
  lagos: { dx: 4.6, dy: 3.6, anchor: "start" },
  ibadan: { dx: -4.4, dy: -2.2, anchor: "end" },
  ph: { dx: 4.6, dy: 1.2, anchor: "start" },
  abuja: { dx: 4.6, dy: -1.4, anchor: "start" },
  kano: { dx: 4.6, dy: -1.2, anchor: "start" },
  nairobi: { dx: 4.6, dy: 1.4, anchor: "start" },
  addis: { dx: 4.6, dy: -2.4, anchor: "start" },
};

const GRATICULE_LONS = [-10, 0, 10, 20, 30, 40];
const GRATICULE_LATS = [30, 20, 10, 0, -10, -20, -30];

function Packet({ d, delay, color }: { d: string; delay: number; color: string }) {
  return (
    <g>
      <circle r="3.4" fill={color} opacity="0.16">
        <animateMotion dur="5.8s" begin={`${delay + 0.28}s`} repeatCount="indefinite" path={d} />
      </circle>
      <circle r="2.15" fill={color} opacity="0.96">
        <animateMotion dur="5.8s" begin={`${delay}s`} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function ChatChip({ thread, place, country }: { thread: MapThread; place: string; country: string }) {
  return (
    <article className="w-full rounded-2xl bg-charcoal/95 p-3 shadow-[0_0_0_1px_rgba(110,231,183,0.16),0_18px_40px_-22px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.16em] text-signal/80">Sample conversation</p>
      <div className="mt-2 flex items-center gap-2.5">
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
    <article className="flex items-center gap-2.5 rounded-2xl bg-charcoal/95 px-2.5 py-2 shadow-[0_0_0_1px_rgba(110,231,183,0.16),0_14px_32px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm">
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

function graticuleLine(lonA: number, latA: number, lonB: number, latB: number) {
  const a = lonLatToSvg(lonA, latA);
  const b = lonLatToSvg(lonB, latB);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function AfricaMap({ reduced = false, activeIndex, pinned = false, onSelect }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    if (reduced || !("IntersectionObserver" in window)) {
      setEntered(true);
      setOnScreen(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting);
      setOnScreen(visible);
      if (visible) setEntered(true);
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    const sync = () => setTabHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!entered) return;
    if (reduced) {
      setNetworkReady(true);
      return;
    }

    const timeout = window.setTimeout(() => setNetworkReady(true), 1300);
    return () => window.clearTimeout(timeout);
  }, [entered, reduced]);

  const motionOn = entered && onScreen && !tabHidden && !reduced;
  const city = MAP_CITIES[activeIndex] ?? MAP_CITIES[0]!;
  const pos = lonLatToPct(city.lon, city.lat);
  const featured = city.threads[0]!;
  const popupLeft = pos.x < 52;
  const popupX = clamp(popupLeft ? pos.x + 6 : pos.x - 38, 3, 58);
  const popupY = clamp(pos.y - 18, 6, 48);
  const africa = ringToSvgPath(AFRICA_RING);
  const madagascar = ringToSvgPath(MADAGASCAR_RING);

  return (
    <div className="relative w-full">
      <div
        ref={stageRef}
        className={cn(
          "map-stage relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#07110e]",
          !reduced && entered && "map-idle",
          motionOn && "map-live",
          entered && "map-entered",
          networkReady && "map-network-ready",
        )}
      >
        <svg
          viewBox="0 0 200 240"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="map-fill" cx="40%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#1a4a3c" />
              <stop offset="46%" stopColor="#0e2c24" />
              <stop offset="100%" stopColor="#071611" />
            </radialGradient>
            <radialGradient id="map-vignette" cx="50%" cy="46%" r="68%">
              <stop offset="42%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
            </radialGradient>
            <linearGradient id="map-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1fae5" />
              <stop offset="42%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="map-arc-live" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id="map-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(214,244,230,0.045)" strokeWidth="0.35" />
            </pattern>
            <clipPath id="map-land">
              <path d={africa} />
              <path d={madagascar} />
            </clipPath>
          </defs>

          <rect width="200" height="240" fill="#07110e" />
          <rect width="200" height="240" fill="url(#map-grid)" />
          <ellipse cx="98" cy="118" rx="78" ry="92" fill="rgba(52,211,153,0.05)" />

          <g clipPath="url(#map-land)" className="map-land-detail">
            {GRATICULE_LATS.map((lat) => (
              <path
                key={`lat-${lat}`}
                d={graticuleLine(-18, lat, 52, lat)}
                fill="none"
                stroke="rgba(209,250,229,0.09)"
                strokeWidth="0.35"
              />
            ))}
            {GRATICULE_LONS.map((lon) => (
              <path
                key={`lon-${lon}`}
                d={graticuleLine(lon, 38, lon, -35)}
                fill="none"
                stroke="rgba(209,250,229,0.08)"
                strokeWidth="0.35"
              />
            ))}
            {[28, 48, 68, 88, 108, 128, 148, 168].map((y, i) => (
              <path
                key={`contour-${y}`}
                d={`M-4 ${y} Q 54 ${y - 7 - (i % 3)} 108 ${y + 2} T 206 ${y - 3}`}
                fill="none"
                stroke="rgba(110,231,183,0.09)"
                strokeWidth="0.45"
              />
            ))}
          </g>

          <path d={africa} fill="url(#map-fill)" className="africa-map-fill" />
          <path d={madagascar} fill="url(#map-fill)" className="africa-map-fill" />
          <path
            d={africa}
            fill="none"
            stroke="rgba(110,231,183,0.28)"
            strokeWidth="3.6"
            className="africa-map-halo"
            filter="url(#map-glow)"
          />
          <path
            d={madagascar}
            fill="none"
            stroke="rgba(110,231,183,0.24)"
            strokeWidth="2.4"
            className="africa-map-halo"
          />
          <path
            d={africa}
            pathLength={1}
            fill="none"
            stroke="url(#map-stroke)"
            strokeWidth="1.25"
            strokeLinejoin="round"
            className="africa-map-outline"
          />
          <path
            d={madagascar}
            pathLength={1}
            fill="none"
            stroke="url(#map-stroke)"
            strokeWidth="0.95"
            strokeLinejoin="round"
            className="africa-map-outline"
          />

          <ellipse cx="98" cy="214" rx="62" ry="7" fill="rgba(110,231,183,0.07)" />
          <rect width="200" height="240" fill="url(#map-vignette)" />

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
                  stroke={live ? "url(#map-arc-live)" : "rgba(110,231,183,0.22)"}
                  strokeWidth={live ? 1.35 : 0.5}
                  strokeDasharray={live ? "1.6 2.2" : "1.2 3.1"}
                  strokeLinecap="round"
                  className={cn(networkReady && !reduced && "map-arc", live && "map-arc-live")}
                  style={{
                    animationDelay: `${i * 0.16}s`,
                    opacity: networkReady ? (live ? 1 : 0.85) : 0,
                    transition: "opacity 260ms ease-out",
                    transitionDelay: networkReady ? `${i * 0.1}s` : "0s",
                  }}
                />
                {networkReady && motionOn ? (
                  <Packet d={d} delay={i * 0.18} color={live ? "#fbbf24" : "#6ee7b7"} />
                ) : null}
              </g>
            );
          })}

          {MAP_CITIES.map((c, i) => {
            const { x, y } = lonLatToSvg(c.lon, c.lat);
            const on = i === activeIndex;
            const nudge = LABEL_NUDGE[c.id] ?? { dx: 4.6, dy: -1.2, anchor: "start" as const };
            const showLabel = on || SPARSE_LABELS.has(c.id);
            return (
              <g key={c.id} transform={`translate(${x} ${y})`}>
                {on ? (
                  <>
                    <circle
                      r="8.5"
                      fill="none"
                      stroke="rgba(110,231,183,0.45)"
                      strokeWidth="0.35"
                      strokeDasharray="1.2 1.4"
                      className={cn(motionOn && "map-orbit")}
                    />
                    <circle
                      r="11"
                      fill="none"
                      stroke="#6ee7b7"
                      strokeWidth="0.5"
                      className={cn(motionOn && "map-radar")}
                      opacity={networkReady ? 1 : 0}
                    />
                    <circle
                      r="11"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.32"
                      className={cn(motionOn && "map-radar")}
                      opacity={networkReady ? 1 : 0}
                      style={{ animationDelay: "0.7s" }}
                    />
                  </>
                ) : null}
                <circle
                  r={on ? 4.1 : 2.05}
                  fill={on ? "#fbbf24" : "#6ee7b7"}
                  filter={on ? "url(#map-glow)" : undefined}
                  className={cn(motionOn && !on && "map-marker-pulse")}
                  opacity={networkReady ? 1 : 0}
                  style={{
                    animationDelay: `${c.delay}s`,
                    transition: "opacity 220ms ease-out",
                    transitionDelay: networkReady ? `${0.16 + c.delay * 0.2}s` : "0ms",
                  }}
                />
                {on ? <circle r="1.35" fill="#fff7e6" /> : null}
                {showLabel ? (
                  <text
                    className="map-city-label"
                    x={nudge.dx}
                    y={nudge.dy}
                    textAnchor={nudge.anchor}
                    fontSize="3.15"
                    fill={on ? "#fde68a" : "rgba(236,253,245,0.78)"}
                  >
                    {c.name}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {networkReady ? <MapFlights reduced={reduced || !motionOn} /> : null}

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-onyx/80 px-2.5 py-1 ring-1 ring-white/10">
          <span className={cn("size-1.5 rounded-full bg-signal", motionOn && "map-legend-ping")} />
          <p className="text-[10px] font-medium uppercase tracking-widest text-signal">Illustrative</p>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden items-center gap-3 rounded-full bg-onyx/75 px-3 py-1.5 ring-1 ring-white/10 md:flex">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-quiet">
            <span className="size-1.5 rounded-full bg-amber-300" />
            Selected
          </span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-quiet">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            City
          </span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-quiet">
            <span className="h-px w-4 border-t border-dashed border-emerald-300/80" />
            Route
          </span>
        </div>

        {reduced || !motionOn ? null : (
          <div className="map-scan pointer-events-none absolute inset-x-[12%] top-[8%] hidden h-px md:block" data-scroll-depth="3" />
        )}

        <div
          className={cn(
            "pointer-events-none absolute z-20 hidden w-[13.25rem] md:block map-feature-chip",
            networkReady && !pinned && "map-chip",
          )}
          data-scroll-depth="5"
          style={{ left: `${popupX}%`, top: `${popupY}%` }}
        >
          <ChatChip thread={featured} place={city.name} country={city.country} />
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 md:hidden map-feature-chip" data-scroll-depth="4">
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
                  aria-pressed={i === activeIndex}
                  onClick={() => onSelect(i)}
                  className="absolute z-30 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              );
            })
          : null}
      </div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-quiet">
        Illustrative ABOS network visualization
      </p>
    </div>
  );
}
