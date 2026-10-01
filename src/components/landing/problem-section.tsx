import { Check, Globe2, PackageSearch, Zap } from "lucide-react";

const CHIPS = ["Mobile-first", "Conversation-led", "Local context", "Multi-user"] as const;

const POINTS = [
  [Globe2, "Local business context", "Country, currency and operating context can travel with the business profile."],
  [PackageSearch, "Real catalog context", "Product and order questions can eventually resolve against the business system."],
  [Zap, "Action-ready workflows", "The system is designed to move from understanding to execution."],
] as const;

export function ProblemSection() {
  return (
    <section className="border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-signal/80">Built for Africa</p>
            <h2 className="mt-4 max-w-2xl font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
              Start with the realities of the market.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
              ABOS is being shaped around mobile-first workflows, conversation-led customer relationships,
              local business context and the need to keep more of the operation visible in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {CHIPS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs text-harmattan-muted"
                >
                  <Check className="size-3.5 text-signal" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-charcoal p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 size-40 rounded-full bg-signal/[0.09] blur-3xl" />
            <div className="relative space-y-3">
              {POINTS.map(([Icon, title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-signal" />
                    <div>
                      <p className="text-sm font-medium text-harmattan">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-harmattan-muted">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
