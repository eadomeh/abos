import { BarChart3, BrainCircuit, MessageCircle, Workflow } from "lucide-react";

const PILLARS = [
  {
    number: "01",
    eyebrow: "CHANNELS",
    title: "WhatsApp is a channel. It is never a second brain.",
    body: "Website, WhatsApp, Instagram, Messenger, email and API all enter one operating layer. Context stays with the business, not the chat app.",
    icon: MessageCircle,
  },
  {
    number: "02",
    eyebrow: "BUSINESS BRAIN",
    title: "Understand. Remember. Check real data. Then act.",
    body: "ABOS reasons from catalog, customers, orders and history. It is designed not to invent a price or pretend an action succeeded.",
    icon: BrainCircuit,
  },
  {
    number: "03",
    eyebrow: "WORKFLOWS",
    title: "Tools and workflows execute the work.",
    body: "Approved actions — hold stock, create a lead, follow up — run through the same Agent Core that answered the customer.",
    icon: Workflow,
  },
  {
    number: "04",
    eyebrow: "HUMAN CONTROL",
    title: "People supervise. The system keeps an audit trail.",
    body: "Analytics give visibility. Sensitive actions stay confirmable. The workspace remains the source of truth for the business.",
    icon: BarChart3,
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="platform" className="scroll-mt-20 border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-signal/80">The platform</p>
          <h2 className="mt-4 font-display text-title font-semibold tracking-[-0.05em] sm:text-6xl">
            One operating layer.
            <span className="block text-quiet">Every channel. One brain.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-harmattan-muted">
            Channels are inputs and outputs. AI is the reasoning engine. Business data is context. Memory is
            continuity. Tools are capabilities. Workflows are execution. Humans are supervisors. ABOS is the
            operating layer.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-2">
          {PILLARS.map(({ number, eyebrow, title, body, icon: Icon }) => (
            <article key={eyebrow} className="bg-charcoal p-7 sm:p-9">
              <div className="flex items-start justify-between gap-6">
                <div className="grid size-11 place-items-center rounded-2xl border border-signal/10 bg-signal/[0.04]">
                  <Icon className="size-5 text-signal" />
                </div>
                <span className="text-xs tracking-widest text-quiet">
                  {number} · {eyebrow}
                </span>
              </div>
              <h3 className="mt-14 max-w-xl font-display text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                {title}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-harmattan-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
