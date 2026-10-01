import { ArrowRight, ChevronDown } from "lucide-react";
import { useAuthUi } from "@/components/landing/auth-modal";
import { WhatsappThread } from "@/components/landing/whatsapp-thread";
import { Button } from "@/components/ui/button";

const TICKER = ["Customers", "Conversations", "Intelligence", "Automation", "Operations"] as const;

export function HeroSection() {
  const { openAuth } = useAuthUi();

  return (
    <section id="main" className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/[0.06] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
          <span className="size-1.5 rounded-full bg-signal" />
          AI Business Operating System
        </div>

        <h1 className="font-display text-display font-semibold tracking-[-0.055em] text-harmattan">
          Run the business from
          <span className="mt-1 block text-signal">one intelligent system.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl font-sans text-lede text-harmattan-muted">
          ABOS connects customers, conversations, intelligence, automation and operations into one command
          layer for growing African businesses.
        </p>

        <div className="mx-auto mt-9 mb-20 flex w-full max-w-md flex-col gap-3 sm:mb-0 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="h-14 w-full rounded-2xl px-7 text-sm sm:w-auto sm:min-w-[220px]"
            onClick={() => openAuth("signup")}
          >
            Enter ABOS
            <ArrowRight className="ml-3 size-4" />
          </Button>
          <button
            type="button"
            onClick={() => document.getElementById("network")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-7 text-sm text-harmattan-muted transition-[background-color,color] duration-150 hover:bg-white/[0.06] hover:text-harmattan sm:w-auto sm:min-w-[220px]"
          >
            See the system <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-14 sm:mt-20">
        <WhatsappThread />
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-white/[0.06] py-4 text-[11px] uppercase tracking-[0.18em] text-quiet">
        {TICKER.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
