import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type ConsoleLine = { text: string; tone: "quiet" | "amber" | "signal" };

const LINES: ConsoleLine[] = [
  { text: '$ search_products("black sneakers")', tone: "quiet" },
  { text: "→ 8 in stock · ₦45,000", tone: "signal" },
  { text: '$ find_customer("Tunde")', tone: "quiet" },
  { text: "→ returning customer, 2 prior orders", tone: "signal" },
  { text: '$ create_lead(product:"black sneakers")', tone: "quiet" },
  { text: "→ lead created", tone: "amber" },
  { text: '$ create_task(follow_up:"confirm Friday delivery")', tone: "quiet" },
  { text: "→ task queued", tone: "amber" },
];

const toneClass: Record<ConsoleLine["tone"], string> = {
  quiet: "text-quiet",
  amber: "text-amber",
  signal: "text-signal",
};

export function AgentConsole() {
  const reduced = usePrefersReducedMotion();
  const [lines, setLines] = useState<string[]>(reduced ? LINES.map((l) => l.text) : []);

  useEffect(() => {
    if (reduced) return;
    let alive = true;

    async function run() {
      let li = 0;
      while (alive) {
        const full = LINES[li].text;
        for (let c = 1; c <= full.length; c += 1) {
          if (!alive) return;
          await new Promise((r) => window.setTimeout(r, 16));
          setLines((prev) => {
            const next = prev.slice(0, li);
            next[li] = full.slice(0, c);
            return next;
          });
        }
        await new Promise((r) => window.setTimeout(r, 420));
        li += 1;
        if (li >= LINES.length) {
          await new Promise((r) => window.setTimeout(r, 1400));
          if (!alive) return;
          li = 0;
          setLines([]);
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [reduced]);

  return (
    <div className="rounded-lg border border-harmattan/10 bg-[#0b0c10] p-4 font-mono text-[11px] leading-[1.9] md:text-xs">
      <p className="sr-only">Live tool calls the ABOS agent makes while it works.</p>
      <div aria-hidden="true" className="min-h-[9.5em]">
        {lines.map((text, i) => (
          <p key={i} className={toneClass[LINES[i].tone]}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
