import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const AVATARS = {
  funke: 'https://i.pravatar.cc/96?img=47',
  amaka: 'https://i.pravatar.cc/96?img=44',
  chidi: 'https://i.pravatar.cc/96?img=12',
  emeka: 'https://i.pravatar.cc/96?img=11',
  tobi: 'https://i.pravatar.cc/96?img=33',
};

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

const heroThreads = [
  {
    name: 'Funke',
    city: 'Accra, Ghana',
    avatar: AVATARS.funke,
    message: 'Same-day East Legon until 4pm.',
    accent: 'from-emerald-300 via-emerald-500 to-cyan-500',
    position: 'left-[5%] top-[24%] sm:left-[7%] sm:top-[21%]',
  },
  {
    name: 'Amaka',
    city: 'Lagos, Nigeria',
    avatar: AVATARS.amaka,
    message: 'Can you keep 6 pieces aside for me?',
    accent: 'from-violet-300 via-fuchsia-500 to-emerald-400',
    position: 'right-[3%] top-[47%] sm:right-[7%] sm:top-[43%]',
  },
  {
    name: 'Chidi',
    city: 'Nairobi, Kenya',
    avatar: AVATARS.chidi,
    message: 'Phone case restock Friday.',
    accent: 'from-amber-300 via-orange-500 to-emerald-400',
    position: 'left-[12%] bottom-[8%] sm:left-[18%] sm:bottom-[7%]',
  },
];

const chatScenarios = [
  {
    name: 'Emeka',
    city: 'Lagos',
    avatar: AVATARS.emeka,
    preview: 'Can you deliver to Ikeja tomorrow?',
    messages: [
      { from: 'customer', text: 'Hi, do you have the black sneakers in size 43?', time: '21:10' },
      { from: 'abos', text: 'Yes — 8 pairs are in stock at ₦45,000.', time: '21:11' },
      { from: 'customer', text: 'Can you deliver to Ikeja tomorrow?', time: '21:11' },
      { from: 'abos', text: 'Yes. Ikeja delivery is available tomorrow.', time: '21:12' },
    ],
  },
  {
    name: 'Amaka',
    city: 'Accra',
    avatar: AVATARS.amaka,
    preview: 'Please follow up on my order.',
    messages: [
      { from: 'customer', text: 'Please follow up on my order from yesterday.', time: '14:08' },
      { from: 'abos', text: 'I found the order and its latest status.', time: '14:09' },
      { from: 'abos', text: 'I have queued the next customer follow-up.', time: '14:09' },
    ],
  },
  {
    name: 'Tobi',
    city: 'Abuja',
    avatar: AVATARS.tobi,
    preview: 'Do you have 20 pieces available?',
    messages: [
      { from: 'customer', text: 'Do you have 20 pieces available for wholesale?', time: '09:21' },
      { from: 'abos', text: 'Checking the business catalog now…', time: '09:21' },
      { from: 'abos', text: 'The current catalog shows 26 units available.', time: '09:22' },
    ],
  },
] as const;

const demoReplies: Record<string, string> = {
  'Check stock': 'Black sneakers: 8 units currently shown in the demo business catalog at ₦45,000.',
  'Find a customer': 'I found Tunde as a returning customer with 2 prior orders in the demo workspace.',
  'Create a lead': 'Lead created for the black sneakers enquiry. Next action: follow up with the customer.',
};

function BrandMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_30px_rgba(52,211,153,.16)]">
      <Sparkles className="h-5 w-5 text-emerald-200" />
    </div>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-3">
      <BrandMark />
      <span>
        <span className="block text-sm font-semibold tracking-[0.24em] text-white">ABOS</span>
        <span className="block text-[8px] uppercase tracking-[0.2em] text-slate-600">AI Business Operating System</span>
      </span>
    </span>
  );
}

function Avatar({ src, name, size = 'md' }: { src: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <img
      src={src}
      alt={`${name} profile`}
      loading="lazy"
      className={`${sizeClass} rounded-full border border-white/15 object-cover shadow-[0_8px_30px_rgba(0,0,0,.35)]`}
    />
  );
}

function HeroAfricaNetwork() {
  const [activeThread, setActiveThread] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setActiveThread((value) => (value + 1) % heroThreads.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [running]);

  const active = heroThreads[activeThread];

  return (
    <section className="relative mx-auto mt-14 max-w-7xl sm:mt-20">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#071015] shadow-[0_35px_120px_rgba(0,0,0,.46)] sm:rounded-[3rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,.10),transparent_26%),radial-gradient(circle_at_20%_70%,rgba(99,102,241,.06),transparent_25%),#060c10]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#04080a] to-transparent" />

        <div className="relative min-h-[680px] sm:min-h-[760px] lg:min-h-[720px]">
          <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-emerald-300/10 bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-emerald-100/60 backdrop-blur-xl sm:left-7 sm:top-7">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,.8)]" />
            live intelligence demo
          </div>

          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-slate-500 backdrop-blur-xl transition hover:text-white sm:right-7 sm:top-7"
          >
            {running ? 'Pause motion' : 'Resume motion'}
          </button>

          <div className="absolute inset-x-0 top-24 px-5 text-center sm:top-28">
            <div className="text-[10px] uppercase tracking-[0.26em] text-emerald-300/70">One business brain. Many conversations.</div>
            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Context travels across the African business network.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Customer signals, business data, AI reasoning and action stay connected even when the conversation starts somewhere else.
            </p>
          </div>

          <div className="absolute left-1/2 top-[58%] h-[390px] w-[305px] -translate-x-1/2 -translate-y-1/2 sm:top-[60%] sm:h-[470px] sm:w-[370px] lg:top-[61%]">
            <div className="absolute inset-[-20%] rounded-[50%] bg-emerald-400/[0.07] blur-3xl" />
            <div className="absolute inset-0 [transform:perspective(1000px)_rotateX(48deg)_rotateZ(-7deg)]">
              <div className="absolute inset-[11%] rounded-[45%] bg-[radial-gradient(circle_at_52%_38%,rgba(52,211,153,.13),transparent_55%)] blur-xl" />
              <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible" role="img" aria-label="3D Africa operating network">
                <defs>
                  <linearGradient id="africaFrontV2" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#dfffee" stopOpacity=".92" />
                    <stop offset="24%" stopColor="#71f0be" stopOpacity=".77" />
                    <stop offset="55%" stopColor="#2fb88a" stopOpacity=".55" />
                    <stop offset="100%" stopColor="#1b315f" stopOpacity=".80" />
                  </linearGradient>
                  <linearGradient id="africaEdgeV2" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#0e6b50" stopOpacity=".70" />
                    <stop offset="100%" stopColor="#07162b" stopOpacity=".95" />
                  </linearGradient>
                  <filter id="mapGlowV2" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="1.3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {Array.from({ length: 14 }).map((_, index) => (
                  <path
                    key={index}
                    d="M40 8 C31 9 26 17 27 26 L20 28 17 35 22 40 20 45 24 50 30 54 28 61 30 70 34 78 38 88 42 92 47 90 50 84 54 78 60 75 65 78 70 76 73 70 78 68 83 62 88 58 87 53 83 48 79 46 81 41 77 36 73 31 70 26 63 23 59 18 54 15 49 10 Z"
                    fill="url(#africaEdgeV2)"
                    opacity={0.08 + index * 0.045}
                    transform={`translate(${index * 0.45} ${index * 0.55})`}
                  />
                ))}

                <path
                  d="M40 8 C31 9 26 17 27 26 L20 28 17 35 22 40 20 45 24 50 30 54 28 61 30 70 34 78 38 88 42 92 47 90 50 84 54 78 60 75 65 78 70 76 73 70 78 68 83 62 88 58 87 53 83 48 79 46 81 41 77 36 73 31 70 26 63 23 59 18 54 15 49 10 Z"
                  fill="url(#africaFrontV2)"
                  stroke="rgba(237,255,248,.72)"
                  strokeWidth=".65"
                  filter="url(#mapGlowV2)"
                />

                <path d="M18 37 C30 30 48 24 68 31" fill="none" stroke="rgba(255,255,255,.11)" strokeWidth=".28" strokeDasharray="1.3 1.7" />
                <path d="M26 62 C43 54 60 49 82 55" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth=".24" strokeDasharray="1.2 1.6" />
                <path d="M28 21 C48 31 53 52 47 76" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".22" strokeDasharray="1.4 1.8" />
                <path d="M58 18 C61 35 61 54 54 78" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".22" strokeDasharray="1.4 1.8" />

                <path d="M30 54 L61 56 L52 80 L22 49 Z" fill="none" stroke="rgba(204,255,233,.34)" strokeWidth=".35" strokeDasharray="1.3 1.4" />
                <circle cx="30" cy="54" r="2" fill="#dcfff0" className="animate-pulse" />
                <circle cx="61" cy="56" r="2" fill="#dcfff0" className="animate-pulse" />
                <circle cx="52" cy="80" r="2" fill="#dcfff0" className="animate-pulse" />
                <circle cx="22" cy="49" r="2" fill="#dcfff0" className="animate-pulse" />
              </svg>
            </div>
          </div>

          {heroThreads.map((thread, index) => (
            <button
              key={thread.name}
              type="button"
              onClick={() => setActiveThread(index)}
              className={`absolute z-20 ${thread.position} w-[190px] text-left sm:w-[240px] ${index === activeThread ? 'scale-[1.02]' : 'scale-100'}`}
              style={{ transition: 'transform 700ms cubic-bezier(.2,.8,.2,1)' }}
            >
              <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#081217]/90 p-3.5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[1.7rem] sm:p-4">
                <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${thread.accent}`} />
                <div className="flex items-center gap-3">
                  <Avatar src={thread.avatar} name={thread.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-white sm:text-sm">{thread.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    </div>
                    <div className="truncate text-[10px] text-slate-600">{thread.city}</div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-slate-300 sm:text-xs">{thread.message}</p>
                <div className="mt-2 flex items-center justify-between text-[8px] uppercase tracking-[0.14em] text-slate-700">
                  <span>customer signal</span>
                  <span>{index === activeThread ? 'active' : 'context'}</span>
                </div>
              </div>
            </button>
          ))}

          <div className="absolute bottom-5 left-1/2 z-20 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 sm:bottom-7">
            <div className="grid overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#081217]/88 shadow-2xl shadow-black/40 backdrop-blur-xl sm:grid-cols-[1.1fr_1fr_1fr] sm:rounded-[1.7rem]">
              <div className="border-b border-white/8 px-4 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.17em] text-emerald-300/70"><Activity className="h-3.5 w-3.5" /> signal</div>
                <div className="mt-2 text-xs text-slate-300">{active.name} · {active.message}</div>
              </div>
              <div className="border-b border-white/8 px-4 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.17em] text-violet-200/70"><BrainCircuit className="h-3.5 w-3.5" /> reasoning</div>
                <div className="mt-2 text-xs text-slate-300">ABOS is linking customer intent to business context.</div>
              </div>
              <div className="px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.17em] text-amber-200/70"><Zap className="h-3.5 w-3.5" /> action</div>
                <div className="mt-2 text-xs text-slate-300">Next step is ready for the operator.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatsAppDemo() {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(1);
  const scenario = chatScenarios[selected];

  useEffect(() => {
    setVisible(1);
    const timer = window.setInterval(() => {
      setVisible((value) => (value >= scenario.messages.length ? 1 : value + 1));
    }, 2100);
    return () => window.clearInterval(timer);
  }, [scenario]);

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#071015] shadow-[0_35px_100px_rgba(0,0,0,.4)] sm:rounded-[2.7rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(52,211,153,.10),transparent_24%),radial-gradient(circle_at_86%_80%,rgba(99,102,241,.07),transparent_22%)]" />
      <div className="relative border-b border-white/8 px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-emerald-300/60">conversation surface</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><MessageCircle className="h-4 w-4" /></span>
              ABOS on WhatsApp
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-slate-600 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> live product demo</div>
        </div>
      </div>

      <div className="relative grid lg:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-white/8 bg-black/10 lg:block">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-4"><div className="text-sm font-semibold">Chats</div><MoreHorizontal className="h-4 w-4 text-slate-600" /></div>
          <div className="border-b border-white/6 p-3"><div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs text-slate-600"><Search className="h-3.5 w-3.5" />Search</div></div>
          <div className="space-y-1 p-2">
            {chatScenarios.map((chat, index) => (
              <button key={chat.name} type="button" onClick={() => setSelected(index)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${selected === index ? 'bg-emerald-300/[0.08]' : 'hover:bg-white/[0.03]'}`}>
                <Avatar src={chat.avatar} name={chat.name} size="md" />
                <div className="min-w-0 flex-1"><div className="text-xs font-medium text-slate-100">{chat.name}</div><div className="truncate text-[10px] text-slate-600">{chat.preview}</div></div>
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
              </button>
            ))}
          </div>
        </aside>

        <div className="bg-[#07141b]">
          <div className="flex items-center justify-between border-b border-white/8 bg-[#071015]/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3"><Avatar src={scenario.avatar} name={scenario.name} size="md" /><div><div className="flex items-center gap-2 text-sm font-semibold text-white">{scenario.name}<span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /></div><div className="text-[10px] text-slate-600">{scenario.city} · online via WhatsApp</div></div></div>
            <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4" /><MoreHorizontal className="h-4 w-4" /></div>
          </div>

          <div className="flex min-h-[520px] flex-col justify-end gap-3 bg-[#0a1820] px-4 py-6 sm:px-8 sm:py-8" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.025) 0, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.02) 0, transparent 1px)', backgroundSize: '22px 22px' }}>
            <div className="mx-auto mb-auto rounded-full border border-white/[0.07] bg-black/10 px-3 py-1 text-[8px] uppercase tracking-[0.18em] text-slate-700">today · context-aware conversation</div>

            {scenario.messages.slice(0, visible).map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex items-end gap-2 ${message.from === 'abos' ? 'justify-end' : 'justify-start'}`}>
                {message.from === 'customer' && <Avatar src={scenario.avatar} name={scenario.name} size="sm" />}
                <div className={`max-w-[90%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-lg ${message.from === 'customer' ? 'rounded-bl-md bg-[#17272d] text-slate-200' : 'rounded-br-md bg-[#0f8e65] text-white'}`}>
                  <div>{message.text}</div>
                  <div className={`mt-1 flex justify-end gap-1 text-[9px] ${message.from === 'customer' ? 'text-slate-600' : 'text-emerald-100/60'}`}>{message.time}{message.from === 'abos' && <span>✓✓</span>}</div>
                </div>
              </div>
            ))}

            {visible < scenario.messages.length && <div className="flex justify-end"><div className="flex items-center gap-1 rounded-[1.2rem] rounded-br-md border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2.5 text-[10px] text-emerald-100/60"><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300" /><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 [animation-delay:120ms]" /><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 [animation-delay:240ms]" /> ABOS is typing…</div></div>}
          </div>

          <div className="border-t border-white/8 bg-[#071015] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.7)]" /><span className="text-xs text-slate-700">ABOS is using business context · product visualization</span><button type="button" onClick={() => setVisible((value) => (value >= scenario.messages.length ? 1 : value + 1))} className="ml-auto rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-emerald-200/80">Next</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskAbosButton() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const actions = Object.keys(demoReplies);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[1.6rem] border border-white/10 bg-[#081217]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:right-7">
          <div className="flex items-center gap-3"><BrandMark /><div><div className="text-sm font-semibold text-white">Ask ABOS</div><div className="text-[10px] text-slate-600">Interactive product demo</div></div><button type="button" onClick={() => setOpen(false)} className="ml-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.04]"><X className="h-4 w-4 text-slate-500" /></button></div>
          <div className="mt-4 grid gap-2">{actions.map((action) => <button key={action} type="button" onClick={() => setAnswer(demoReplies[action])} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3 text-left text-xs text-slate-300 transition hover:border-emerald-300/20 hover:bg-emerald-300/[0.04]"><div className="flex items-center justify-between"><span>{action}</span><ArrowRight className="h-3.5 w-3.5 text-emerald-300/70" /></div></button>)}</div>
          {answer && <div className="mt-3 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-3 py-3 text-xs leading-5 text-emerald-100/80">{answer}</div>}
        </div>
      )}
      <button type="button" aria-label="Ask ABOS about the platform" onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-4 z-50 grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-emerald-300 via-emerald-400 to-violet-400 text-[#04110b] shadow-[0_0_42px_rgba(52,211,153,.25)] transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 sm:bottom-7 sm:right-7"><MessageCircle className="h-7 w-7" strokeWidth={1.8} /><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#04080a] bg-emerald-300" /></button>
    </>
  );
}

function NetworkSignalStrip() {
  const cards = useMemo(() => [
    ['Lagos', 'Customer intent detected', 'returning buyer · high intent'],
    ['Accra', 'Follow-up ready', 'East Legon · same-day delivery'],
    ['Nairobi', 'Inventory signal', '26 units visible in catalog'],
  ], []);

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-3">
      {cards.map(([city, title, detail]) => (
        <div key={city} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-emerald-300/70"><MapPin className="h-3.5 w-3.5" />{city}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /></div>
          <div className="mt-5 text-sm font-medium text-slate-200">{title}</div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
        </div>
      ))}
    </div>
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
      <style>{`
        @keyframes abosPulseGlow { 0%,100% { opacity:.25; transform:scale(1) } 50% { opacity:.85; transform:scale(1.08) } }
        @keyframes abosFloat { 0%,100% { transform:translate3d(0,0,0) } 50% { transform:translate3d(0,-8px,0) } }
        @keyframes abosShimmer { 0% { transform:translateX(-120%) } 100% { transform:translateX(120%) } }
        .abos-float { animation: abosFloat 5.8s ease-in-out infinite; }
        .abos-glow { animation: abosPulseGlow 4.6s ease-in-out infinite; }
        .abos-shimmer { animation: abosShimmer 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .abos-float, .abos-glow, .abos-shimmer, .animate-pulse, .animate-ping { animation:none !important; }
          html { scroll-behavior:auto; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="abos-glow absolute -right-52 top-[-15rem] h-[34rem] w-[34rem] rounded-full bg-emerald-400/[0.07] blur-[120px]" />
        <div className="absolute -left-52 top-[48%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.035] blur-[120px]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#04080a]/[0.80] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8 sm:py-4">
          <button type="button" onClick={() => scrollTo('top')} className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60" aria-label="Go to ABOS home"><Logo /></button>
          <nav className="hidden items-center gap-8 md:flex"><button type="button" onClick={() => scrollTo('platform')} className="text-xs text-slate-500 transition hover:text-white">Platform</button><button type="button" onClick={() => scrollTo('network')} className="text-xs text-slate-500 transition hover:text-white">Network</button><button type="button" onClick={() => scrollTo('system')} className="text-xs text-slate-500 transition hover:text-white">How it works</button></nav>
          <div className="flex items-center gap-2"><button type="button" onClick={onGetStarted} className="hidden rounded-xl px-4 py-2.5 text-xs text-slate-400 transition hover:text-white sm:block">Log in</button><button type="button" onClick={onGetStarted} className="group inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-[#03100a] shadow-[0_0_35px_rgba(52,211,153,.15)] transition hover:bg-emerald-200">Get started <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></button><button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] md:hidden" aria-label="Toggle navigation">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
        {menuOpen && <div className="border-t border-white/[0.06] px-4 py-3 md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1"><button type="button" onClick={() => scrollTo('platform')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">Platform</button><button type="button" onClick={() => scrollTo('network')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">Network</button><button type="button" onClick={() => scrollTo('system')} className="rounded-xl px-3 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white">How it works</button><button type="button" onClick={onGetStarted} className="mt-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white">Enter ABOS</button></div></div>}
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-emerald-200/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.75)]" /> AI Business Operating System</div>
            <h1 className="text-[clamp(3rem,11vw,6.6rem)] font-semibold leading-[0.91] tracking-[-0.06em]">Run the business from <span className="block bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">one intelligent system.</span></h1>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-lg">ABOS connects customers, conversations, intelligence, automation and operations into one command layer for growing African businesses.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={onGetStarted} className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_55px_rgba(52,211,153,.14)] transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80">Enter ABOS <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button><button type="button" onClick={() => scrollTo('network')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white">Explore the operating network <ChevronDown className="h-4 w-4" /></button></div>
          </div>

          <HeroAfricaNetwork />

          <div className="mx-auto mt-7 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.07] sm:grid-cols-5"><div className="bg-[#071015] px-3 py-3 text-center text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:px-4">Customer context</div><div className="bg-[#071015] px-3 py-3 text-center text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:px-4">Business data</div><div className="bg-[#071015] px-3 py-3 text-center text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:px-4">AI reasoning</div><div className="bg-[#071015] px-3 py-3 text-center text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:px-4">Action</div><div className="col-span-2 bg-[#071015] px-3 py-3 text-center text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:col-span-1 sm:px-4">Outcome</div></div>
        </section>

        <section id="network" className="scroll-mt-20 border-y border-white/[0.06] bg-[#050d11] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr]">
              <div><div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The operating network</div><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Signal becomes context.<span className="block text-slate-500">Context becomes action.</span></h2><p className="mt-6 max-w-xl text-base leading-7 text-slate-500">The public experience should show what ABOS is actually building: a connected operating layer underneath customer conversations and business decisions.</p><NetworkSignalStrip /></div>
              <div className="rounded-[2rem] border border-white/10 bg-[#061015] p-6 sm:p-8"><div className="flex items-center justify-between"><div className="text-[9px] uppercase tracking-[0.18em] text-slate-700">System trace</div><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-emerald-300/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> live demo</div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{steps.map(([n, title, body], index) => <div key={n} className={`relative overflow-hidden rounded-2xl border p-5 ${index === 1 ? 'border-violet-300/10 bg-violet-300/[0.03]' : index === 2 ? 'border-emerald-300/10 bg-emerald-300/[0.03]' : 'border-white/8 bg-white/[0.025]'}`}><div className="flex items-center justify-between"><span className="text-[9px] tracking-[0.18em] text-slate-700">{n}</span><ArrowRight className="h-4 w-4 text-emerald-300/60" /></div><div className="mt-7 text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">{title}</div><p className="mt-3 text-sm leading-6 text-slate-500">{body}</p></div>)}</div><div className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05]"><Zap className="h-4 w-4 text-emerald-300" /></div><div><div className="text-xs font-medium text-slate-200">The system is designed to move from understanding to execution.</div><div className="mt-1 text-[10px] text-slate-700">Customer message → business context → next action</div></div></div></div></div>
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 border-y border-white/[0.06] bg-[#071014]/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8"><div className="max-w-3xl"><div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The platform</div><h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">One operating layer.<span className="block text-slate-500">Connected by context.</span></h2><p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">ABOS is built around the work that keeps a business moving, so each layer becomes more useful as the business creates more context.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-2">{pillars.map(({ number, eyebrow, title, body, icon: Icon }) => <article key={eyebrow} className="bg-[#081014] p-7 sm:p-9"><div className="flex items-start justify-between gap-6"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04]"><Icon className="h-5 w-5 text-emerald-300" /></div><span className="text-[9px] tracking-[0.18em] text-slate-700">{number} · {eyebrow}</span></div><h3 className="mt-14 max-w-xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h3><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{body}</p></article>)}</div></div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#061016] py-24 sm:py-32"><div className="mx-auto max-w-7xl px-4 sm:px-8"><div className="max-w-3xl"><div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">Conversation intelligence</div><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">WhatsApp feels like a channel.<span className="block text-slate-500">ABOS treats it like business context.</span></h2><p className="mt-6 max-w-2xl text-base leading-7 text-slate-500">A realistic customer conversation is only the front edge. Underneath it, ABOS can connect customer history, catalog data, reasoning and the next action.</p></div><div className="mt-14"><WhatsAppDemo /></div></div></section>

        <section id="system" className="scroll-mt-20 py-24 sm:py-32"><div className="mx-auto max-w-7xl px-4 sm:px-8"><div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">Under the interface</div><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">The visible experience is only the front door.</h2><p className="mt-6 max-w-xl text-base leading-7 text-slate-500">ABOS is designed so conversations, memory, reasoning, tools and workflows can eventually operate as one system.</p><div className="mt-8 grid gap-3">{['Business context stays attached to the interaction.', 'AI reasoning can use the business data it is authorized to see.', 'Operators keep visibility into actions, outcomes and history.'].map((item) => <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><div className="text-sm leading-6 text-slate-400">{item}</div></div>)}</div></div><div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071015] p-6 sm:p-8"><div className="abos-shimmer absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" /><div className="relative space-y-3">{[['Customer signal', 'Funke asks about same-day delivery.'], ['Context', 'ABOS reads customer + business state.'], ['Reasoning', 'Available stock + delivery window match.'], ['Action', 'Answer customer and prepare next step.']].map(([title, body], index) => <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/70">0{index + 1} · {title}</div><ArrowRight className="h-4 w-4 text-slate-700" /></div><div className="mt-3 text-sm text-slate-300">{body}</div></div>)}</div></div></div></div></section>

        <section className="border-t border-white/[0.06] py-24 sm:py-32"><div className="mx-auto max-w-5xl px-4 text-center sm:px-8"><div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">The vision</div><h2 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Not another chatbot. The operating layer behind the business.</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500">ABOS is being built toward a system that understands the business, remembers context, reasons over what is happening, and eventually helps execute the work.</p><button type="button" onClick={onGetStarted} className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80">Start with ABOS <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button></div></section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-4 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between"><div>ABOS · African Business OS</div><div>AI Business Operating System</div></div></footer>
      <AskAbosButton />
    </div>
  );
}
