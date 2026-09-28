import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  Globe2,
  Menu,
  MessageCircle,
  PackageSearch,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const pillars = [
  {
    number: '01',
    eyebrow: 'CONVERSATIONS',
    title: 'Every customer interaction becomes business context.',
    body: 'Bring customer conversations, intent, history and next actions into one operating layer.',
    icon: MessageCircle,
  },
  {
    number: '02',
    eyebrow: 'INTELLIGENCE',
    title: 'AI works with your business, not beside it.',
    body: 'ABOS is designed to reason from the context your business already has and turn it into useful decisions.',
    icon: BrainCircuit,
  },
  {
    number: '03',
    eyebrow: 'AUTOMATION',
    title: 'Turn repeated work into reliable workflows.',
    body: 'Move follow-ups, tasks and routine actions from scattered manual work into connected workflows.',
    icon: Workflow,
  },
  {
    number: '04',
    eyebrow: 'OPERATIONS',
    title: 'See the operating picture in one place.',
    body: 'Connect customers, sales activity, conversations and operational signals into one command center.',
    icon: BarChart3,
  },
];

const steps = [
  ['01', 'CAPTURE', 'Messages, customers and business events enter one workspace.'],
  ['02', 'UNDERSTAND', 'AI adds context, intent and useful business signals.'],
  ['03', 'ACT', 'People and automations respond, follow up and execute.'],
  ['04', 'LEARN', 'The operating history becomes stronger context for the next action.'],
];

function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_25px_rgba(52,211,153,.12)]">
        <img src="/abos-mark.svg" alt="" className="h-6 w-6" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-[0.24em] text-white">ABOS</span>
        <span className="block text-[8px] uppercase tracking-[0.2em] text-slate-600">AI Business Operating System</span>
      </span>
    </span>
  );
}

function WhatsAppDemo() {
  const messages = [
      { side: 'customer', text: 'Hi, do you have the black sneakers in stock?', time: '21:10' },
      { side: 'abos', text: 'Yes — we have 8 pairs of the black sneakers. They\'re ₦45,000.', time: '21:11' },
      { side: 'customer', text: 'Can you deliver to Ikeja tomorrow?', time: '21:11' },
      { side: 'abos', text: 'Yes. We can arrange delivery to Ikeja tomorrow. I\'ll keep the order context ready for the next step.', time: '21:12' },
    ];

  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisible((current) => (current >= messages.length ? 1 : current + 1));
    }, 2600);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#071015] shadow-2xl shadow-black/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,.10),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(45,212,191,.05),transparent_26%)]" />
      <div className="relative border-b border-white/10 px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-slate-600">Customer conversation</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> ABOS on WhatsApp
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300/70" /> Reads business context
          </div>
        </div>
      </div>

      <div className="relative p-4 sm:p-7">
        <div className="mx-auto min-h-[430px] max-w-3xl rounded-[1.7rem] border border-white/[0.08] bg-[#050c11] p-4 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] text-xs font-semibold text-slate-300">C</div>
              <div>
                <div className="text-sm font-medium text-slate-100">Customer</div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-slate-700">WhatsApp</div>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-[0.16em] text-emerald-300/70">ABOS active</span>
          </div>

          <div className="flex min-h-[340px] flex-col justify-end gap-3 pt-5">
            {messages.slice(0, visible).map((message, index) => (
              <div
                key={`${message.time}-${index}`}
                className={`max-w-[86%] rounded-[1.3rem] px-4 py-3 text-sm leading-6 shadow-lg ${
                  message.side === 'customer'
                    ? 'self-start rounded-bl-md bg-[#172329] text-slate-200'
                    : 'self-end rounded-br-md bg-emerald-500/[0.85] text-[#062116]'
                }`}
              >
                <div>{message.text}</div>
                <div className={`mt-1 text-[9px] ${message.side === 'customer' ? 'text-slate-600' : 'text-emerald-950/60'}`}>{message.time}</div>
              </div>
            ))}

            <div className="self-end rounded-[1.2rem] border border-emerald-300/10 bg-emerald-300/[0.035] px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-emerald-200/60">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" /> context → answer → next action
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskAbosButton() {
  return (
    <button
      type="button"
      aria-label="Ask ABOS about the platform"
      className="fixed bottom-5 right-5 z-40 grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-emerald-300 via-emerald-400 to-violet-400 text-[#04110b] shadow-[0_0_40px_rgba(52,211,153,.22)] transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 sm:bottom-7 sm:right-7"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.8} />
      <span className="absolute -top-1 right-0 h-3 w-3 rounded-full border-2 border-[#04080a] bg-emerald-300" />
    </button>
  );
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#04080a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-52 top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-emerald-400/[0.07] blur-[120px]" />
        <div className="absolute -left-52 top-[48%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.035] blur-[120px]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#04080a]/[0.82] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button type="button" onClick={() => scrollTo('top')} aria-label="Go to ABOS home" className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60">
            <Logo />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button type="button" onClick={() => scrollTo('platform')} className="text-xs text-slate-500 transition hover:text-white">Platform</button>
            <button type="button" onClick={() => scrollTo('system')} className="text-xs text-slate-500 transition hover:text-white">How it works</button>
            <button type="button" onClick={() => scrollTo('africa')} className="text-xs text-slate-500 transition hover:text-white">Built for Africa</button>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onGetStarted} className="hidden rounded-xl px-4 py-2.5 text-xs text-slate-400 transition hover:text-white sm:block">Log in</button>
            <button type="button" onClick={onGetStarted} className="group inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-[#03100a] shadow-[0_0_35px_rgba(52,211,153,.15)] transition hover:bg-emerald-200">
              Get started
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] md:hidden" aria-label="Toggle navigation">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.06] px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <button type="button" onClick={() => scrollTo('platform')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">Platform</button>
              <button type="button" onClick={() => scrollTo('system')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">How it works</button>
              <button type="button" onClick={() => scrollTo('africa')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">Built for Africa</button>
              <button type="button" onClick={onGetStarted} className="mt-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white">Enter ABOS</button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> AI Business Operating System
            </div>

            <h1 className="text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">
              Run the business from
              <span className="block bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">one intelligent system.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              ABOS connects customers, conversations, intelligence, automation and operations into one command layer for growing African businesses.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onGetStarted} className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_55px_rgba(52,211,153,.14)] transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80">
                Enter ABOS
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button type="button" onClick={() => scrollTo('platform')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                See the system <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-14 sm:mt-20">
            <WhatsAppDemo />
          </div>

          <div className="mx-auto mt-8 flex max-w-5xl items-center justify-between gap-4 border-y border-white/[0.06] py-4 text-[9px] uppercase tracking-[0.16em] text-slate-700">
            <span>Customer context</span><span>Business data</span><span>AI reasoning</span><span>Action</span><span>Outcome</span>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The platform</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">One operating layer.<span className="block text-slate-500">Connected by context.</span></h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">ABOS is built around the work that keeps a business moving, so each layer becomes more useful as the business creates more context.</p>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-2">
              {pillars.map(({ number, eyebrow, title, body, icon: Icon }) => (
                <article key={eyebrow} className="bg-[#081014] p-7 sm:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04]"><Icon className="h-5 w-5 text-emerald-300" /></div>
                    <span className="text-[9px] tracking-[0.18em] text-slate-700">{number} · {eyebrow}</span>
                  </div>
                  <h3 className="mt-14 max-w-xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="system" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">How it works</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Signal becomes context. Context becomes action.</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">The long-term value is the connected system underneath the interfaces—not a chatbot sitting beside the business.</p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#081014] p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  {steps.map(([number, title, body]) => (
                    <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                      <div className="flex items-center justify-between"><span className="text-[9px] tracking-[0.18em] text-slate-700">{number}</span><ArrowRight className="h-4 w-4 text-emerald-300/60" /></div>
                      <div className="mt-8 text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">{title}</div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="africa" className="scroll-mt-20 border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">Built for Africa</div>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Start with the realities of the market.</h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">ABOS is being shaped around mobile-first workflows, conversation-led customer relationships, local business context and the need to keep more of the operation visible in one place.</p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {['Mobile-first', 'Conversation-led', 'Local context', 'Multi-user'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-[10px] text-slate-400"><Check className="h-3.5 w-3.5 text-emerald-300" />{item}</span>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081014] p-6 sm:p-8">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/[0.09] blur-3xl" />
                <div className="relative space-y-3">
                  {[
                    [Globe2, 'Local business context', 'Country, currency and operating context can travel with the business profile.'],
                    [PackageSearch, 'Real catalog context', 'Product and order questions can eventually resolve against the business system.'],
                    [Zap, 'Action-ready workflows', 'The system is designed to move from understanding to execution.'],
                  ].map(([Icon, title, body]) => (
                    <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                      <div className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><div><div className="text-sm font-medium text-slate-200">{title as string}</div><p className="mt-1 text-xs leading-5 text-slate-500">{body as string}</p></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The vision</div>
            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Not another chatbot. The operating layer behind the business.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500">ABOS is being built toward a system that understands the business, remembers context, reasons over what is happening, and eventually helps execute the work.</p>
            <button type="button" onClick={onGetStarted} className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80">Start with ABOS <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div>ABOS · African Business OS</div>
          <div>AI Business Operating System</div>
        </div>
      </footer>

      <AskAbosButton />
    </div>
  );
}
