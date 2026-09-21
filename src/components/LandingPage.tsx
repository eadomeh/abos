import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Bot,
  ChevronDown,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type IconType = typeof Bot;

const pillars: Array<{
  eyebrow: string;
  title: string;
  body: string;
  icon: IconType;
}> = [
  {
    eyebrow: "01 · CONVERSATIONS",
    title: "Every customer interaction becomes business context.",
    body: "Keep conversations, customer history, intent and next actions connected instead of scattered across separate tools.",
    icon: MessageSquare,
  },
  {
    eyebrow: "02 · INTELLIGENCE",
    title: "AI works with your business, not beside it.",
    body: "ABOS is designed to reason from the operating data you already have and surface useful signals, summaries and actions.",
    icon: BrainCircuit,
  },
  {
    eyebrow: "03 · AUTOMATION",
    title: "Turn repeated work into reliable workflows.",
    body: "Define events, conditions and actions so routine follow-ups can move without constant manual coordination.",
    icon: Workflow,
  },
  {
    eyebrow: "04 · GROWTH",
    title: "See the operating picture in one place.",
    body: "Bring customers, sales activity, conversations and operational signals into a decision-ready workspace.",
    icon: BarChart3,
  },
];

const flow = [
  ["01", "CAPTURE", "Messages, customers and business events enter one workspace."],
  ["02", "UNDERSTAND", "AI adds context, intent and useful business signals."],
  ["03", "ACT", "People and automations respond, follow up and execute."],
  ["04", "LEARN", "The operating history becomes better context for the next action."],
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-emerald-300/15 bg-white/[0.03]">
        <img src="/eadomeh-logo.png" alt="eADOMEH" className="h-full w-full object-contain" />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-sm font-semibold tracking-[0.24em] text-white">ABOS</span>
        <span className="block text-[8px] uppercase tracking-[0.2em] text-slate-600">
          AI Business Operating System
        </span>
      </span>
    </span>
  );
}

function CommandCenterPreview() {
  const bars = [28, 38, 34, 49, 44, 66, 61, 78, 70, 91, 83, 96];

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-10 rounded-[3rem] bg-emerald-400/[0.08] blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081014]/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.7)]" />
            ABOS Command Center
            <span className="text-slate-700">·</span>
            Live workspace
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-600 sm:block">
            Operations / Overview
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_.65fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Revenue motion</div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  NGN 18.4M
                </div>
              </div>
              <div className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-1.5 text-xs text-emerald-200">
                +18.4%
              </div>
            </div>

            <div className="mt-10 flex h-56 items-end gap-2.5">
              {bars.map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-400/15 via-emerald-300/55 to-emerald-100/90"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["24", "Active leads"],
                ["91%", "AI coverage"],
                ["38", "Automations"],
                ["17", "Open tasks"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="text-lg font-semibold text-white">{value}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">AI operating signals</div>

            {[
              ["High-intent lead detected", "Follow up within 30 min", "HIGH"],
              ["Customer conversation summarized", "Context ready for handoff", "READY"],
              ["Inventory event needs review", "One product is running low", "WATCH"],
            ].map(([title, body, tag]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-200">{title}</span>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-emerald-300/70">{tag}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{body}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-4">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">AI Commander</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your next actions are organized around what is happening now—not a generic checklist.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemGraph() {
  const nodes = [
    ["CUSTOMERS", "Profiles + history"],
    ["CONVERSATIONS", "Messages + intent"],
    ["AI", "Context + decisions"],
    ["AUTOMATIONS", "Rules + actions"],
    ["OPERATIONS", "Tasks + execution"],
    ["ANALYTICS", "Signals + outcomes"],
  ];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081014] p-6 sm:p-8">
      <div className="absolute left-1/2 top-1/2 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent lg:block" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map(([name, detail], index) => (
          <div
            key={name}
            className={`relative rounded-2xl border border-white/10 bg-white/[0.025] p-5 ${
              index === 2 ? "border-emerald-300/20 bg-emerald-300/[0.045]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index === 2 && <Sparkles className="h-4 w-4 text-emerald-300" />}
            </div>
            <div className="mt-8 text-sm font-semibold text-white">{name}</div>
            <div className="mt-1 text-xs text-slate-600">{detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#04080a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-40 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-emerald-400/[0.07] blur-[120px]" />
        <div className="absolute -left-40 top-[40%] h-[28rem] w-[28rem] rounded-full bg-cyan-400/[0.035] blur-[110px]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#04080a]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => jump("top")}
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
            aria-label="Go to ABOS home"
          >
            <Logo />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["platform", "Platform"],
              ["system", "The system"],
              ["africa", "Built for Africa"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => jump(id)}
                className="text-xs text-slate-500 transition hover:text-white"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onGetStarted}
              className="hidden rounded-xl px-4 py-2.5 text-xs text-slate-400 transition hover:text-white sm:block"
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-[#03100a] shadow-[0_0_35px_rgba(52,211,153,.15)] transition hover:bg-emerald-200"
            >
              Launch ABOS
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] md:hidden"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.06] px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ["platform", "Platform"],
                ["system", "The system"],
                ["africa", "Built for Africa"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => jump(id)}
                  className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={onGetStarted}
                className="mt-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white"
              >
                Enter ABOS
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              AI Business Operating System
            </div>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">
              Run the business from
              <span className="block bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                one intelligent system.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              ABOS connects customers, conversations, intelligence, automation and operations into a single command center for growing African businesses.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_55px_rgba(52,211,153,.14)] transition hover:bg-emerald-200"
              >
                Enter your command center
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => jump("platform")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Explore ABOS
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.18em] text-slate-700">
              <span>Customers</span>
              <span>Conversations</span>
              <span>AI intelligence</span>
              <span>Automation</span>
              <span>Analytics</span>
            </div>
          </div>

          <div className="mt-16 sm:mt-20">
            <CommandCenterPreview />
          </div>
        </section>

        <section id="platform" className="border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The platform</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                One operating layer.
                <span className="block text-slate-500">Four connected motions.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">
                ABOS is structured around the work that keeps a business moving. Each layer feeds the next, so the system becomes more useful as your business generates more context.
              </p>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-2">
              {pillars.map(({ eyebrow, title, body, icon: Icon }) => (
                <article key={eyebrow} className="bg-[#081014] p-7 sm:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04]">
                      <Icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <span className="text-[9px] tracking-[0.18em] text-slate-700">{eyebrow}</span>
                  </div>
                  <h3 className="mt-14 max-w-xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="system" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-end gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The ABOS model</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  Context becomes the infrastructure.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">
                  The long-term advantage is not another chatbot. It is a connected business model where the same context can power people, AI, automations and reporting.
                </p>
              </div>

              <SystemGraph />
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">How it works</div>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Signal → intelligence → action → growth.
            </h2>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flow.map(([number, title, body]) => (
                <div key={number} className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-6">
                  <span className="text-[9px] tracking-[0.18em] text-slate-700">{number}</span>
                  <div className="mt-10 text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">{title}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="africa" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">Built for Africa</div>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  Start with the realities of the market.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">
                  ABOS is being shaped around mobile-first workflows, conversation-led customer relationships, local business context and the need to keep more of the operation visible in one place.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["01", "Conversation-first", "Keep customer communication central to the operating workflow."],
                  ["02", "Local context", "Business settings can carry country and currency context."],
                  ["03", "Multi-user", "Separate business membership from personal identity."],
                  ["04", "Integration-ready", "Build the core system independently from any single channel."],
                ].map(([number, title, body]) => (
                  <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <div className="text-[9px] tracking-[0.18em] text-slate-700">{number}</div>
                    <div className="mt-8 text-sm font-semibold text-white">{title}</div>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-300/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,.10),transparent_45%),#071014] px-6 py-16 text-center sm:px-10 sm:py-20">
            <ShieldCheck className="mx-auto h-7 w-7 text-emerald-300" />
            <div className="mt-5 text-[10px] uppercase tracking-[0.24em] text-slate-600">The next stage</div>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Build once. Connect everything that matters.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500">
              ABOS is designed to grow from a working business workspace into a durable operating layer for customers, AI, automation and analytics.
            </p>
            <button
              onClick={onGetStarted}
              className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_55px_rgba(52,211,153,.13)] transition hover:bg-emerald-200"
            >
              Launch ABOS
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Logo />
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                ABOS — AI Business Operating System. Build. Connect. Automate. Grow.
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-700">Built by</div>
              <div className="mt-1 text-sm font-semibold tracking-[0.14em] text-slate-300">eADOMEH</div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 ABOS. All systems operational.</span>
            <span className="flex items-center gap-2"><Zap className="h-3 w-3 text-emerald-300/60" /> AI-first business infrastructure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
