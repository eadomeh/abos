import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { AbosMark } from "@/components/landing/abos-mark";
import { useAuthUi } from "@/components/landing/auth-modal";
import { Button } from "@/components/ui/button";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteNav({ onLogin }: { onLogin?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { openAuth } = useAuthUi();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (id: string) => {
    scrollTo(id);
    setMenuOpen(false);
  };

  const signIn = () => {
    setMenuOpen(false);
    if (onLogin) onLogin();
    else openAuth("signin");
  };

  return (
    <header className="site-nav sticky top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-signal focus:px-3 focus:py-2 focus:text-onyx"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-8">
        <button
          type="button"
          onClick={() => go("main")}
          aria-label="Go to ABOS home"
          className="flex min-w-0 items-center gap-2 rounded-xl sm:gap-3"
        >
          <AbosMark className="h-12 w-auto sm:h-14 md:h-[60px]" />
          <span className="min-w-0 text-left">
            <span className="block font-display text-[13px] font-semibold tracking-[0.16em] text-harmattan sm:text-sm sm:tracking-[0.24em]">
              ABOS
            </span>
            <span className="hidden truncate text-[10px] uppercase tracking-[0.16em] text-quiet sm:block">
              AI Business Operating System
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          <button type="button" onClick={() => go("platform")} className="text-xs text-quiet transition-colors duration-150 hover:text-harmattan">
            Platform
          </button>
          <button type="button" onClick={() => go("network")} className="text-xs text-quiet transition-colors duration-150 hover:text-harmattan">
            How it thinks
          </button>
          <button type="button" onClick={() => go("conversations")} className="text-xs text-quiet transition-colors duration-150 hover:text-harmattan">
            In action
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={signIn}
            className="hidden rounded-xl px-3 py-2.5 text-xs text-quiet transition-colors duration-150 hover:text-harmattan md:inline-flex"
          >
            Log in
          </button>
          <Button type="button" size="md" className="h-10 rounded-2xl px-3 text-[11px] sm:px-4 sm:text-xs" onClick={() => openAuth("signup")}>
            Get started
            <ArrowRight className="ml-1.5 size-3.5 sm:ml-2" />
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            ref={menuButtonRef}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="site-nav-menu" className="border-t border-white/[0.06] px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <button type="button" onClick={() => go("platform")} className="rounded-xl px-3 py-3 text-left text-sm text-harmattan-muted hover:bg-white/[0.03] hover:text-harmattan">
              Platform
            </button>
            <button type="button" onClick={() => go("network")} className="rounded-xl px-3 py-3 text-left text-sm text-harmattan-muted hover:bg-white/[0.03] hover:text-harmattan">
              How it thinks
            </button>
            <button type="button" onClick={() => go("conversations")} className="rounded-xl px-3 py-3 text-left text-sm text-harmattan-muted hover:bg-white/[0.03] hover:text-harmattan">
              In action
            </button>
            <button
              type="button"
              onClick={signIn}
              className="mt-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-harmattan"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openAuth("signup");
              }}
              className="rounded-xl px-3 py-3 text-left text-sm text-harmattan-muted hover:bg-white/[0.03] hover:text-harmattan"
            >
              Enter ABOS
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
