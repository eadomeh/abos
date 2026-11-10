import { ArrowRight } from "lucide-react";

export function VisionSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8" data-scroll-reveal>
        <p className="text-xs uppercase tracking-widest text-signal/80">The vision</p>
        <h2 className="mx-auto mt-4 max-w-4xl font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
          Not another chatbot. The operating layer behind the business.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
          ABOS understands the business, remembers the business, coordinates the business, automates the
          business, and helps the business act — with humans still in control.
        </p>
        <button
          type="button"
          onClick={() => document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="mt-9 inline-flex items-center rounded-2xl border border-white/15 px-5 py-3 text-sm text-harmattan-muted transition-colors hover:text-harmattan"
        >
          Continue to get started
          <ArrowRight className="ml-2 size-4" />
        </button>
      </div>
    </section>
  );
}
