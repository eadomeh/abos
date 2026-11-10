import { ArrowRight } from "lucide-react";

const STEPS = [
  ["01", "CAPTURE", "Messages and business events enter one workspace through the ABOS Gateway."],
  ["02", "UNDERSTAND", "Live Understanding reads intent, urgency, language and next action."],
  ["03", "ACT", "The Agent Core uses tools, memory and permissions — then humans stay in control."],
  ["04", "REMEMBER", "Session Summary and business memory make the next conversation smarter."],
] as const;

export function ThinkSection() {
  return (
    <section id="system" className="scroll-mt-20 py-12 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-10">
          <div data-scroll-reveal>
            <p className="text-xs uppercase tracking-widest text-signal/80">How it works</p>
            <h2 className="mt-3 font-display text-title font-semibold tracking-[-0.05em] sm:mt-4 sm:text-6xl">
              Signal becomes context. Context becomes action.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-harmattan-muted sm:mt-6 sm:text-base sm:leading-7">
              The product is not the chat bubble. It is the system underneath: Agent Core, business memory,
              tools, workflows and a workspace people can trust.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-charcoal p-4 sm:rounded-[2rem] sm:p-8" data-scroll-reveal>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {STEPS.map(([number, title, body]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 sm:p-5" data-scroll-reveal-item={number}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-widest text-quiet">{number}</span>
                    <ArrowRight className="size-4 text-signal/60" />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-widest text-signal/80 sm:mt-8">{title}</p>
                  <p className="mt-2 text-sm leading-5 text-harmattan-muted sm:mt-3 sm:leading-6">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
