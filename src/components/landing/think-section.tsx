import { ArrowRight } from "lucide-react";

const STEPS = [
  ["01", "CAPTURE", "Messages and business events enter one workspace through the ABOS Gateway."],
  ["02", "UNDERSTAND", "Live Understanding reads intent, urgency, language and next action."],
  ["03", "ACT", "The Agent Core uses tools, memory and permissions — then humans stay in control."],
  ["04", "REMEMBER", "Session Summary and business memory make the next conversation smarter."],
] as const;

export function ThinkSection() {
  return (
    <section id="system" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-signal/80">How it works</p>
            <h2 className="mt-4 font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
              Signal becomes context. Context becomes action.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-harmattan-muted">
              The product is not the chat bubble. It is the system underneath: Agent Core, business memory,
              tools, workflows and a workspace people can trust.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-charcoal p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {STEPS.map(([number, title, body]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-widest text-quiet">{number}</span>
                    <ArrowRight className="size-4 text-signal/60" />
                  </div>
                  <p className="mt-8 text-xs uppercase tracking-widest text-signal/80">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-harmattan-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
