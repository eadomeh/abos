import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks";

const CAPABILITIES = [
  { label: "One connected business profile", Icon: Store },
  { label: "Customer context", Icon: Users },
  { label: "Catalog intelligence", Icon: Package },
  { label: "Order visibility", Icon: ClipboardList },
  { label: "Human-reviewed payments", Icon: CreditCard },
  { label: "Inventory checks", Icon: Boxes },
  { label: "Trusted knowledge", Icon: Sparkles },
  { label: "Delivery handoff", Icon: Truck },
  { label: "Role-based access", Icon: ShieldCheck },
  { label: "Business insights", Icon: BarChart3 },
] as const;

export function LiveRail() {
  const reduced = usePrefersReducedMotion();
  const row = reduced ? CAPABILITIES : [...CAPABILITIES, ...CAPABILITIES];

  return (
    <section
      className="relative max-w-[100vw] overflow-hidden border-y border-white/[0.06] bg-onyx"
      aria-label="ABOS connected business capabilities"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-onyx to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-onyx to-transparent" aria-hidden="true" />
      <div className="live-rail overflow-hidden py-4">
        <div
          className={reduced ? "flex w-max gap-3 px-6" : "live-marquee flex w-max gap-3 px-6"}
          aria-hidden={reduced ? undefined : true}
        >
          {row.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3 pr-6">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-signal/25 bg-signal/[0.08] text-signal shadow-[0_0_18px_-8px_rgba(110,231,183,0.8)]">
                <item.Icon className="size-3.5" aria-hidden="true" />
              </span>
              <p className="whitespace-nowrap text-sm text-harmattan">{item.label}</p>
              <span className="h-px w-8 bg-gradient-to-r from-signal/40 to-violet/30" aria-hidden="true" />
            </div>
          ))}
        </div>
        {reduced ? null : (
          <ul className="sr-only">
            {CAPABILITIES.map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
