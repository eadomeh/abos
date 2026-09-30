import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  Globe2,
  MessageCircle,
  Menu,
  MoreHorizontal,
  PackageSearch,
  Phone,
  Search,
  Sparkles,
  Video,
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
] as const;

const whatsappMessages = [
  { side: 'customer', text: 'Hi, do you have the black sneakers in stock?', time: '21:10' },
  { side: 'abos', text: "Yes — 8 pairs are currently available. They're ₦45,000.", time: '21:11' },
  { side: 'customer', text: 'Can you deliver to Ikeja tomorrow?', time: '21:11' },
  { side: 'abos', text: "Yes. Delivery to Ikeja is available tomorrow. I'll keep the context ready for the next step.", time: '21:12' },
] as const;

const networkRegions = [
  {
    city: 'Lagos',
    region: 'Lagos State',
    detail: 'Customer conversations',
    position: { left: '30%', top: '54%' },
  },
  {
    city: 'Accra',
    region: 'Greater Accra',
    detail: 'Business context',
    position: { left: '22%', top: '49%' },
  },
  {
    city: 'Nairobi',
    region: 'Nairobi County',
    detail: 'Operational workflows',
    position: { left: '61%', top: '56%' },
  },
  {
    city: 'Johannesburg',
    region: 'Gauteng',
    detail: 'Growth signals',
    position: { left: '52%', top: '80%' },
  },
] as const;

type NetworkCity = (typeof networkRegions)[number];

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

function Avatar({ initials, tone = 'emerald' }: { initials: string; tone?: 'emerald' | 'violet' | 'amber' }) {
  const toneClass = {
    emerald: 'from-emerald-300/30 via-emerald-500/20 to-slate-800',
    violet: 'from-violet-300/30 via-violet-500/20 to-slate-800',
    amber: 'from-amber-300/30 via-amber-500/20 to-slate-800',
  }[tone];

  return (
    <span className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br ${toneClass}`}>
      <span className="text-[10px] font-semibold text-white/85">{initials}</span>
    </span>
  );
}

function WhatsAppDemo() {
  const [visible, setVisible] = useState(1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setVisible((current) => (current >= whatsappMessages.length ? 1 : current + 1));
    }, 2400);
    return () => window.clearInterval(timer);
  }, [playing]);

  const visibleMessages = whatsappMessages.slice(0, visible);

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#071015] shadow-[0_30px_100px_rgba(0,0,0,.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,.11),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(34,197,94,.05),transparent_26%)]" />

      <div className="relative border-b border-white/[0.08] px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-slate-600">Live conversation concept</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              ABOS on WhatsApp
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-slate-500 transition hover:border-emerald-300/20 hover:text-emerald-200 sm:flex"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${playing ? 'bg-emerald-300' : 'bg-slate-600'}`} />
            {playing ? 'Playing' : 'Paused'}
          </button>
        </div>
      </div>

      <div className="relative grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/[0.08] bg-black/10 lg:block">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
            <div className="text-sm font-semibold text-white">Chats</div>
            <MoreHorizontal className="h-4 w-4 text-slate-600" />
          </div>
          <div className="border-b border-white/[0.06] p-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs text-slate-600">
              <Search className="h-3.5 w-3.5" />
              Search
            </div>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-300/[0.07] px-3 py-3">
              <Avatar initials="EM" tone="emerald" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-100">Emeka</div>
                <div className="truncate text-[10px] text-slate-600">Ikeja delivery</div>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-300" />
            </div>
            <div className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3">
              <Avatar initials="AM" tone="violet" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-300">Amaka</div>
                <div className="truncate text-[10px] text-slate-700">New order</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3">
              <Avatar initials="TJ" tone="amber" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-300">Tobi</div>
                <div className="truncate text-[10px] text-slate-700">Product question</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-h-[500px] bg-[#07151c]">
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#071015]/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Avatar initials="EM" tone="emerald" />
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  Emeka
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </div>
                <div className="text-[10px] text-slate-600">online · via WhatsApp</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="h-4 w-4" />
              <Video className="h-4 w-4" />
              <MoreHorizontal className="h-4 w-4" />
            </div>
          </div>

          <div
            className="flex min-h-[420px] flex-col justify-end gap-3 bg-[#071a21] px-4 py-6 sm:px-8"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,.028) 0, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.02) 0, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          >
            <div className="mx-auto mb-auto rounded-full border border-white/[0.07] bg-black/10 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-slate-700">
              Today · ABOS is handling the conversation
            </div>

            {visibleMessages.map((message, index) => (
              <div
                key={`${message.time}-${index}`}
                className={`flex items-end gap-2 ${message.side === 'abos' ? 'justify-end' : 'justify-start'}`}
              >
                {message.side === 'customer' && <Avatar initials="EM" tone="emerald" />}
                <div
                  className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-lg ${
                    message.side === 'customer'
                      ? 'rounded-bl-md bg-[#17272d] text-slate-200'
                      : 'rounded-br-md bg-[#1b7b5b] text-white'
                  }`}
                >
                  <div>{message.text}</div>
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${message.side === 'customer' ? 'text-slate-600' : 'text-emerald-100/60'}`}>
                    {message.time}
                    {message.side === 'abos' && <span className="tracking-[-0.2em]">✓✓</span>}
                  </div>
                </div>
              </div>
            ))}

            {visible < whatsappMessages.length && (
              <div className="flex items-center justify-end gap-2">
                <div className="rounded-[1.2rem] rounded-br-md border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2.5 text-[10px] text-emerald-100/50">
                  <span className="mr-1 inline-flex gap-0.5 align-middle">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 [animation-delay:120ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 [animation-delay:240ms]" />
                  </span>
                  ABOS is thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.08] bg-[#071015] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.7)]" />
              <span className="text-xs text-slate-700">ABOS responds from business context · demo only</span>
              <button
                type="button"
                onClick={() => setVisible((value) => (value >= whatsappMessages.length ? 1 : value + 1))}
                className="ml-auto rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-emerald-200/80 transition hover:bg-emerald-300/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AfricaNetwork() {
  const [selectedCity, setSelectedCity] = useState<NetworkCity>(networkRegions[0]);

  const nodeLines = useMemo(
    () => [
      { from: [30, 54], to: [61, 56] },
      { from: [22, 49], to: [30, 54] },
      { from: [61, 56], to: [52, 80] },
      { from: [30, 54], to: [52, 80] },
    ],
    [],
  );

  return (
    <section id="network" className="scroll-mt-20 border-y border-white/[0.06] bg-[#050d11] py-24 sm:py-32">
      <style>{`
        @keyframes abosNetworkPulse {
          0%, 100% { opacity: .18; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.18); }
        }
        @keyframes abosFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .abos-network-pulse { animation: abosNetworkPulse 2.5s ease-in-out infinite; }
        .abos-float-a { animation: abosFloat 5.5s ease-in-out infinite; }
        .abos-float-b { animation: abosFloat 6.5s ease-in-out .6s infinite; }
        .abos-float-c { animation: abosFloat 5.8s ease-in-out 1.2s infinite; }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The African operating network</div>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              One business brain.
              <span className="block text-slate-500">Many markets. One context.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">
              ABOS is designed so the same operating layer can sit behind conversations, workflows and business decisions across African markets.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {networkRegions.map((item) => {
                const active = item.city === selectedCity.city;
                return (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => setSelectedCity(item)}
                    className={`rounded-full border px-3.5 py-2 text-[10px] transition ${
                      active
                        ? 'border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100'
                        : 'border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    {item.region}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-emerald-300/10 bg-emerald-300/[0.035] p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05]">
                  <Globe2 className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-slate-700">Selected node</div>
                  <div className="mt-1 text-sm font-semibold text-slate-200">{selectedCity.city}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {selectedCity.region} · {selectedCity.detail}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.75)]" />
              Illustrative network visualization · not live telemetry
            </div>
          </div>

          <div className="relative min-h-[560px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,.07),transparent_38%),#061015] p-4 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(45,212,191,.045),transparent_24%),radial-gradient(circle_at_80%_80%,rgba(52,211,153,.035),transparent_25%)]" />

            <div className="relative mx-auto flex min-h-[500px] max-w-[700px] items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="absolute left-[7%] top-[6%] h-[85%] w-[72%] overflow-visible"
                aria-label="Stylized 3D Africa network map"
                role="img"
              >
                <defs>
                  <linearGradient id="africaFront" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#c7ffe6" stopOpacity=".94" />
                    <stop offset="52%" stopColor="#34d399" stopOpacity=".5" />
                    <stop offset="100%" stopColor="#062c20" stopOpacity=".86" />
                  </linearGradient>
                  <linearGradient id="africaSide" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#0f6b4c" stopOpacity=".72" />
                    <stop offset="100%" stopColor="#031b14" stopOpacity=".95" />
                  </linearGradient>
                  <filter id="africaGlow" x="-35%" y="-35%" width="170%" height="170%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {Array.from({ length: 9 }).map((_, index) => (
                  <path
                    key={`extrude-${index}`}
                    d="M40 8 C31 9 26 17 27 26 L20 28 17 35 22 40 20 45 24 50 30 54 28 61 30 70 34 78 38 88 42 92 47 90 50 84 54 78 60 75 65 78 70 76 73 70 78 68 83 62 88 58 87 53 83 48 79 46 81 41 77 36 73 31 70 26 63 23 59 18 54 15 49 10 Z"
                    fill="url(#africaSide)"
                    opacity={0.12 + index * 0.05}
                    transform={`translate(${index * 0.55} ${index * 0.85})`}
                  />
                ))}

                <path
                  d="M40 8 C31 9 26 17 27 26 L20 28 17 35 22 40 20 45 24 50 30 54 28 61 30 70 34 78 38 88 42 92 47 90 50 84 54 78 60 75 65 78 70 76 73 70 78 68 83 62 88 58 87 53 83 48 79 46 81 41 77 36 73 31 70 26 63 23 59 18 54 15 49 10 Z"
                  fill="url(#africaFront)"
                  stroke="rgba(193,255,226,.55)"
                  strokeWidth=".55"
                  filter="url(#africaGlow)"
                />

                <path d="M30 50 L60 56 L51 80" fill="none" stroke="rgba(173,255,224,.25)" strokeWidth=".35" strokeDasharray="1.2 1.4" />
                <path d="M22 49 L30 54 L61 56" fill="none" stroke="rgba(173,255,224,.18)" strokeWidth=".3" strokeDasharray="1 1.5" />

                {nodeLines.map((line, index) => (
                  <line
                    key={index}
                    x1={line.from[0]}
                    y1={line.from[1]}
                    x2={line.to[0]}
                    y2={line.to[1]}
                    stroke="rgba(167,243,208,.38)"
                    strokeWidth=".4"
                    strokeDasharray="1.4 1.5"
                  />
                ))}

                <circle cx="30" cy="54" r="2.2" fill="#d1fae5" opacity=".88" className="abos-network-pulse" />
                <circle cx="61" cy="56" r="2.2" fill="#d1fae5" opacity=".88" className="abos-network-pulse" />
                <circle cx="52" cy="80" r="2.2" fill="#d1fae5" opacity=".88" className="abos-network-pulse" />
                <circle cx="22" cy="49" r="2.2" fill="#d1fae5" opacity=".88" className="abos-network-pulse" />

                <path d="M41 6 C43 8 46 10 49 12" fill="none" stroke="rgba(220,255,240,.24)" strokeWidth=".55" />
              </svg>

              <div className="pointer-events-none absolute left-[4%] top-[10%] hidden w-[190px] sm:block sm:left-[1%] lg:left-[4%]">
                <div className="abos-float-a rounded-2xl border border-white/10 bg-[#09151b]/92 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials="EM" tone="emerald" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold text-slate-200">Emeka</div>
                      <div className="text-[9px] text-slate-600">Lagos</div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">“Can I get delivery tomorrow?”</p>
                </div>
              </div>

              <div className="pointer-events-none absolute right-[2%] top-[16%] hidden w-[205px] sm:block">
                <div className="abos-float-b rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.05] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-300/10 bg-emerald-300/[0.06]">
                      <Sparkles className="h-4 w-4 text-emerald-300" />
                    </span>
                    <div className="text-[10px] font-semibold text-emerald-100/80">ABOS reasoning</div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">“Stock is available. Delivery route is ready for the next action.”</p>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-[8%] left-[12%] hidden w-[230px] sm:block">
                <div className="abos-float-c rounded-2xl border border-white/10 bg-[#09151b]/92 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-violet-300/10 bg-violet-300/[0.05]">
                      <Workflow className="h-4 w-4 text-violet-200" />
                    </span>
                    <div className="text-[10px] font-semibold text-slate-200">Workflow handoff</div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">Conversation → context → action → history</p>
                </div>
              </div>

              {networkRegions.map((item) => {
                const active = selectedCity.city === item.city;
                return (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => setSelectedCity(item)}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={item.position}
                    aria-label={`Select ${item.city}`}
                  >
                    <span className={`relative grid h-8 w-8 place-items-center rounded-full border transition ${
                      active
                        ? 'border-emerald-200/80 bg-emerald-200/15 shadow-[0_0_34px_rgba(110,231,183,.4)]'
                        : 'border-emerald-300/30 bg-emerald-300/10 group-hover:border-emerald-200/65'
                    }`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-100' : 'bg-emerald-300'}`} />
                      <span className="absolute inset-0 rounded-full border border-emerald-300/20 animate-ping" />
                    </span>
                    <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#081015]/92 px-2.5 py-1 text-[9px] text-slate-400 opacity-0 backdrop-blur transition group-hover:opacity-100">
                      {item.city}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-[#09151b]/90 p-4 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.16em] text-slate-700">ABOS network</div>
                <div className="mt-1 text-lg font-semibold text-white">Context travels.</div>
                <div className="mt-1 text-[10px] leading-5 text-slate-600">Channels change. The operating layer stays connected.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
            <button type="button" onClick={() => scrollTo('network')} className="text-xs text-slate-500 transition hover:text-white">Africa network</button>
            <button type="button" onClick={() => scrollTo('system')} className="text-xs text-slate-500 transition hover:text-white">How it works</button>
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
              <button type="button" onClick={() => scrollTo('network')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">Africa network</button>
              <button type="button" onClick={() => scrollTo('system')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">How it works</button>
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

          <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-white/[0.06] py-4 text-[9px] uppercase tracking-[0.16em] text-slate-700">
            <span>Customer context</span><span>Business data</span><span>AI reasoning</span><span>Action</span><span>Outcome</span>
          </div>
        </section>

        <AfricaNetwork />

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

        <section className="border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
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
