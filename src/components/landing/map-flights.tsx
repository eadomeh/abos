import { useEffect, useRef } from "react";
import { MAP_FLIGHTS, arcPath, cityById, type MapFlight } from "@/components/landing/map-data";
import { cn } from "@/lib/utils";

const SVG_W = 200;
const SVG_H = 240;

function FlightBubble({ flight }: { flight: MapFlight }) {
  const abos = flight.side === "abos";
  return (
    <div
      className={cn(
        "flex max-w-[9.25rem] items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)] ring-1 sm:max-w-[12rem]",
        abos ? "bg-wa-out ring-signal/30" : "bg-charcoal/95 ring-white/14 backdrop-blur-sm",
      )}
    >
      <img
        src={flight.avatar}
        alt=""
        width={20}
        height={20}
        className="size-5 shrink-0 rounded-full object-cover ring-1 ring-white/20"
      />
      <p className="truncate text-[10px] leading-none text-wa-text sm:text-[11px]">{flight.text}</p>
    </div>
  );
}

function anchorTransform(x: number): string {
  if (x < 42) return "translate(6px, -50%)";
  if (x > 158) return "translate(calc(-100% - 6px), -50%)";
  return "translate(-50%, -50%)";
}

export function MapFlights({ reduced = false }: { reduced?: boolean }) {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const paths = MAP_FLIGHTS.map((flight) => {
      const from = cityById(flight.from);
      const to = cityById(flight.to);
      if (!from || !to) return null;
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", arcPath(from, to));
      return { flight, el, len: el.getTotalLength() };
    }).filter((row): row is { flight: MapFlight; el: SVGPathElement; len: number } => row !== null);

    const place = (index: number, x: number, y: number, opacity: number) => {
      const node = nodeRefs.current[index];
      if (!node) return;
      node.style.left = `${(x / SVG_W) * 100}%`;
      node.style.top = `${(y / SVG_H) * 100}%`;
      node.style.opacity = String(opacity);
      node.style.transform = anchorTransform(x);
    };

    if (reduced) {
      paths.forEach((row, index) => {
        const pt = row.el.getPointAtLength(row.len * (0.4 + (index % 3) * 0.08));
        place(index, pt.x, pt.y, index < 4 ? 1 : 0);
      });
      return;
    }

    let raf = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const elapsed = now - started;
      paths.forEach((row, index) => {
        const cycle = row.flight.duration * 1000;
        const local = elapsed - row.flight.delay * 1000;
        if (local < 0) {
          place(index, 0, 0, 0);
          return;
        }
        const u = (local % cycle) / cycle;
        const pt = row.el.getPointAtLength(u * row.len);
        const fade = u < 0.08 ? u / 0.08 : u > 0.9 ? (1 - u) / 0.1 : 1;
        place(index, pt.x, pt.y, fade);
      });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {MAP_FLIGHTS.map((flight, index) => (
        <div
          key={flight.id}
          ref={(node) => {
            nodeRefs.current[index] = node;
          }}
          className="map-flight absolute left-0 top-0"
          style={{ opacity: 0 }}
        >
          <FlightBubble flight={flight} />
        </div>
      ))}
    </div>
  );
}
