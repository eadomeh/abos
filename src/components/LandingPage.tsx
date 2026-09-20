import { ArrowRight, BarChart3, BrainCircuit, Bot, MessageSquare, Play, Sparkles, Workflow, Zap } from "lucide-react";

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const bars = [25,42,31,58,49,69,61,91];
  const features = [
    [MessageSquare, "CONVERSATIONS", "Every customer interaction becomes organized, searchable business intelligence."],
    [BrainCircuit, "INTELLIGENCE", "AI combines intent with your real business context."],
    [Workflow, "AUTOMATION", "Turn repetitive follow-ups and operational work into reliable workflows."],
    [BarChart3, "GROWTH", "See customers, activity and performance in one decision-ready view."]
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050a0d] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#050a0d]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button onClick={() => window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_30px_rgba(52,211,153,.14)]"><Bot className="h-5 w-5 text-emerald-300"/></span>
            <span><b className="block text-sm tracking-[.24em]">ABOS</b><small className="text-[9px] uppercase tracking-[.2em] text-slate-500">AI Business Operating System</small></span>
          </button>
          <nav className="hidden gap-8 text-sm text-slate-400 md:flex"><a href="#platform" className="hover:text-white">Platform</a><a href="#capabilities" className="hover:text-white">Capabilities</a><a href="#flow" className="hover:text-white">How it works</a></nav>
          <button onClick={onGetStarted} className="group flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#03100a] shadow-[0_0_35px_rgba(52,211,153,.18)] transition hover:bg-emerald-200">Launch ABOS <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/></button>
        </div>
      </header>
      <main>
        <section id="platform" className="relative isolate overflow-hidden px-5 pb-20 pt-36 sm:px-8 sm:pt-44">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,.16),transparent_35%),radial-gradient(circle_at_85%_35%,rgba(34,211,238,.08),transparent_25%),#050a0d]"/>
          <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:40px_40px]"/>
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-[10px] uppercase tracking-[.22em] text-emerald-200/80"><Sparkles className="h-3.5 w-3.5"/> The intelligent operating layer</div>
              <h1 className="text-balance text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-7xl lg:text-[94px]">Your business.<span className="block bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">One intelligent system.</span></h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">ABOS connects customers, conversations, operations, automation and intelligence into one command center built to help ambitious businesses move faster.</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={onGetStarted} className="group flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_60px_rgba(52,211,153,.2)] hover:bg-emerald-200">Enter your command center <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></button>
                <a href="#capabilities" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-7 py-4 text-sm text-slate-300 hover:bg-white/[.07]"><Play className="h-4 w-4 fill-current"/> Explore the system</a>
              </div>
            </div>
            <div className="relative mx-auto mt-16 max-w-6xl">
              <div className="absolute -inset-12 rounded-[3rem] bg-emerald-400/10 blur-3xl"/>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1216]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-slate-500"><i className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"/> ABOS COMMAND CENTER · LIVE</span><span className="text-[10px] uppercase tracking-[.2em] text-slate-600">Growth workspace</span></div>
                <div className="grid lg:grid-cols-[1.35fr_.65fr]">
                  <div className="border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
                    <div className="flex items-end justify-between"><div><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Revenue motion</div><div className="mt-2 text-4xl font-semibold">$184.2K</div></div><span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">+18.4%</span></div>
                    <div className="mt-10 flex h-52 items-end gap-3">{bars.map((h,i)=><div key={i} className="group h-full flex-1 flex items-end"><div style={{height:`${h}%`}} className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400/20 to-emerald-200/90 transition group-hover:shadow-[0_0_24px_rgba(52,211,153,.18)]"/></div>)}</div>
                  </div>
                  <div className="space-y-3 p-6 sm:p-9">
                    {[[24,"Active leads",MessageSquare],[91,"AI response coverage",BrainCircuit],[38,"Automations live",Workflow]].map(([v,l,I])=><div key={String(l)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-4"><div><b className="text-xl">{String(v)}{String(l).includes("coverage") ? "%" : ""}</b><p className="mt-1 text-xs text-slate-500">{String(l)}</p></div><I className="h-4 w-4 text-emerald-300/70"/></div>)}
                    <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[.05] p-4"><div className="flex gap-3"><BrainCircuit className="mt-1 h-4 w-4 text-emerald-300"/><p className="text-xs leading-5 text-slate-400"><b className="text-slate-200">AI detected a growth signal.</b><br/>Three high-intent conversations need follow-up.</p></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-t border-white/10 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <span className="text-[10px] uppercase tracking-[.25em] text-emerald-300/80">The operating layer</span>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">The parts of business that usually live apart—connected.</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">From the first message to the next sale, ABOS keeps context connected so your business can act instead of react.</p>
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2">
              {features.map(([I,t,b],i)=><article key={String(t)} className="group bg-[#081014] p-8 sm:p-10 hover:bg-[#0b161b]"><div className="flex justify-between"><span className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><I className="h-5 w-5 text-emerald-300"/></span><span className="text-[10px] text-slate-700">0{i+1}</span></div><div className="mt-12 text-[10px] uppercase tracking-[.22em] text-emerald-300/70">{String(t)}</div><h3 className="mt-3 text-2xl font-semibold">{String(b)}</h3></article>)}
            </div>
          </div>
        </section>

        <section id="flow" className="bg-[#081014] py-28 sm:py-36">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <span className="text-[10px] uppercase tracking-[.25em] text-emerald-300/80">How it works</span>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Signal → intelligence → action → growth.</h2>
            <div className="mt-12 grid gap-3 sm:grid-cols-4">{[["01","CAPTURE","Messages and leads enter one workspace."],["02","UNDERSTAND","AI combines intent with business context."],["03","ACT","Reply, follow up and automate."],["04","LEARN","Every interaction improves the system."]].map(([n,t,b])=><div key={n} className="rounded-3xl border border-white/10 bg-white/[.025] p-6"><div className="text-[10px] text-slate-600">{n}</div><div className="mt-8 text-[10px] tracking-[.2em] text-emerald-300/70">{t}</div><p className="mt-2 text-sm leading-6 text-slate-500">{b}</p></div>)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden py-28 text-center sm:py-36"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(16,185,129,.14),transparent_55%)]"/><div className="relative mx-auto max-w-4xl px-5"><Zap className="mx-auto h-7 w-7 text-emerald-300"/><h2 className="mt-6 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Build the business you imagined.</h2><p className="mx-auto mt-5 max-w-2xl text-slate-500">ABOS is the command layer. Your business is what we build on top of it.</p><button onClick={onGetStarted} className="mt-9 rounded-2xl bg-emerald-300 px-7 py-4 text-sm font-semibold text-[#03100a] shadow-[0_0_60px_rgba(52,211,153,.18)] hover:bg-emerald-200">Launch ABOS <ArrowRight className="ml-2 inline h-4 w-4"/></button></div></section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-[10px] uppercase tracking-[.2em] text-slate-700">ABOS · Build · Connect · Automate · Grow</footer>
    </div>
  );
}
