import { ArrowUp, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ASK_SUGGESTIONS, replyToAbos, type AgentReply } from "@/components/landing/chat-data";
import { PERSON } from "@/components/landing/people";
import { cn } from "@/lib/utils";

type Line = {
  id: string;
  side: "user" | "abos";
  text: string;
  person?: AgentReply["person"];
};

const WELCOME: Line = {
  id: "welcome",
  side: "abos",
  text: "I'm the ABOS agent. Ask about stock, delivery, holds or a live customer thread — I answer from the catalog, never from invention.",
};

export function AskAbos() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lines, setLines] = useState<Line[]>([WELCOME]);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, typing, open]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  function pushReply(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userLine: Line = { id: crypto.randomUUID(), side: "user", text: trimmed };
    setLines((prev) => [...prev, userLine]);
    setInput("");
    setTyping(true);
    const reply = replyToAbos(trimmed);
    window.setTimeout(() => {
      setLines((prev) => [
        ...prev,
        { id: crypto.randomUUID(), side: "abos", text: reply.text, person: reply.person },
      ]);
      setTyping(false);
    }, 700);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    pushReply(input);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
      <div
        className={cn(
          "pointer-events-auto flex flex-col items-end gap-3",
          open ? "w-full max-w-[26rem]" : "w-auto",
        )}
      >
        {open ? (
          <section
            className="chat-panel flex h-[min(30rem,calc(100svh-9.5rem))] w-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-charcoal/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md"
            aria-label="ABOS live agent"
          >
            <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative grid size-10 place-items-center rounded-full bg-signal/15 text-signal">
                  <MessageCircle className="size-4" />
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-signal ring-2 ring-charcoal" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-harmattan">ABOS agent</p>
                  <p className="text-xs text-signal">Online · catalog-backed</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full text-quiet hover:bg-white/5 hover:text-harmattan"
                aria-label="Close live chat"
              >
                <X className="size-4" />
              </button>
            </header>

            <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {lines.map((line) => (
                <div key={line.id} className={cn("flex", line.side === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6",
                      line.side === "user"
                        ? "rounded-br-sm bg-signal text-primary-foreground"
                        : "rounded-bl-sm bg-white/[0.05] text-harmattan",
                    )}
                  >
                    {line.person ? (
                      <span className="mb-2 flex items-center gap-2">
                        <img
                          src={PERSON[line.person].avatar}
                          alt=""
                          width={22}
                          height={22}
                          className="size-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-signal">
                          {PERSON[line.person].name} · {PERSON[line.person].city}
                        </span>
                      </span>
                    ) : null}
                    <p>{line.text}</p>
                  </div>
                </div>
              ))}
              {typing ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.05] px-3 py-2">
                    <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
                    <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
                    <span className="typing-dot size-1.5 rounded-full bg-signal/80" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-2">
              {ASK_SUGGESTIONS.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => pushReply(hint)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-harmattan-muted hover:border-signal/30 hover:text-signal"
                >
                  {hint}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/8 p-3">
              <input
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ABOS about stock or delivery"
                className="h-11 flex-1 rounded-full bg-onyx px-4 text-sm text-harmattan outline-none ring-1 ring-white/10 placeholder:text-quiet focus:ring-signal/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="grid size-11 place-items-center rounded-full bg-signal text-primary-foreground disabled:opacity-40"
                aria-label="Send message"
              >
                <ArrowUp className="size-4" />
              </button>
            </form>
          </section>
        ) : null}

        <button
          type="button"
          aria-label={open ? "Close ABOS agent" : "Open ABOS agent"}
          onClick={() => setOpen((v) => !v)}
          className="ask-fab relative grid size-14 place-items-center rounded-full text-onyx sm:size-16"
        >
          <span className="ask-fab-ring" aria-hidden="true" />
          {open ? <X className="relative size-7" /> : <MessageCircle className="relative size-7" />}
        </button>
      </div>
    </div>
  );
}
