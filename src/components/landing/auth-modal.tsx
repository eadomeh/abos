import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AuthMode = "signin" | "signup" | "forgot";

type AuthUiValue = {
  openAuth: (mode: AuthMode) => void;
};

const AuthUiContext = createContext<AuthUiValue | null>(null);

export function useAuthUi() {
  const ctx = useContext(AuthUiContext);
  if (!ctx) throw new Error("useAuthUi must be used within AuthUiProvider");
  return ctx;
}

export function AuthUiProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const openAuth = useCallback((next: AuthMode) => setMode(next), []);

  return (
    <AuthUiContext.Provider value={{ openAuth }}>
      {children}
      <AuthModal mode={mode} onModeChange={setMode} />
    </AuthUiContext.Provider>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.5 3.6v3h4c2.4-2.2 3.5-5.4 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-4-3c-1.1.8-2.5 1.2-3.9 1.2-3 0-5.6-2-6.5-4.7H1.4v3.1C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.6c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7.3H1.4C.5 9 0 10.9 0 12.5s.5 3.5 1.4 5.2l4.1-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.4l4.1 3.1C6.4 6.8 9 4.8 12 4.8z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.7 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-1-3-1c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 0 0 1.3 2.1 2.9 2 1.2 0 1.6-.8 3.1-.8s1.8.8 3 .8 2-1.9 2.8-3.8c.9-1.3 1.2-2.6 1.2-2.7-.1 0-2.3-.9-2.3-3.4zM14.6 5.8c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z"
      />
    </svg>
  );
}

function AuthModal({
  mode,
  onModeChange,
}: {
  mode: AuthMode | null;
  onModeChange: (mode: AuthMode | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const formId = useId();

  function resetForm() {
    setEmail("");
    setPassword("");
    setError("");
    setNotice("");
    setBusy(false);
  }

  function close() {
    onModeChange(null);
    resetForm();
  }

  function stub(action: string) {
    // Isolated stub — lift this landing UI into Supabase later; do not wire src/lib/auth.
    console.info("[abos] auth stub", action);
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setError("");
      setNotice("This preview does not create or sign in to an account.");
    }, 450);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode !== "forgot" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    stub(mode === "signin" ? "email-signin" : mode === "signup" ? "email-signup" : "forgot");
  }

  const open = mode !== null;
  const title =
    mode === "signup" ? "Create your ABOS account" : mode === "forgot" ? "Reset your password" : "Sign in to ABOS";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-onyx/80" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-charcoal p-6 shadow-[0_0_0_1px_rgba(246,243,236,0.1)] focus:outline-none"
        >
          <Dialog.Title className="font-display text-xl font-semibold tracking-tight text-harmattan">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-harmattan-muted">
            {mode === "forgot"
              ? "Enter the email on your account. We will not send a message from this preview."
              : "ABOS — African Business OS. Continue with a provider or email."}
          </Dialog.Description>

          <Dialog.Close
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-md text-quiet hover:text-harmattan"
            aria-label="Close"
          >
            <X className="size-5" />
          </Dialog.Close>

          {mode !== "forgot" ? (
            <div className="mt-6 flex flex-col gap-2">
              <Button
                type="button"
                variant="panel"
                className="w-full gap-2"
                disabled={busy}
                onClick={() => stub("google")}
              >
                <GoogleMark />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="panel"
                className="w-full gap-2"
                disabled={busy}
                onClick={() => stub("apple")}
              >
                <AppleMark />
                Continue with Apple
              </Button>
            </div>
          ) : null}

          {mode !== "forgot" ? (
            <div className="my-5 flex items-center gap-3 text-xs text-quiet">
              <span className="h-px flex-1 bg-harmattan/15" />
              or email
              <span className="h-px flex-1 bg-harmattan/15" />
            </div>
          ) : (
            <div className="mt-6" />
          )}

          <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor={`${formId}-email`} className="mb-1.5 block text-sm text-harmattan-muted">
                Email
              </label>
              <Input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setError("");
                  setNotice("");
                }}
                required
              />
            </div>
            {mode !== "forgot" ? (
              <div>
                <label htmlFor={`${formId}-password`} className="mb-1.5 block text-sm text-harmattan-muted">
                  Password
                </label>
                <Input
                  id={`${formId}-password`}
                  name="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(ev) => {
                    setPassword(ev.target.value);
                    setError("");
                    setNotice("");
                  }}
                  required
                  minLength={8}
                />
              </div>
            ) : null}

            {mode === "signin" ? (
              <button
                type="button"
                className="self-start text-sm text-harmattan-muted hover:text-amber"
                onClick={() => {
                  setError("");
                  setNotice("");
                  onModeChange("forgot");
                }}
              >
                Forgot password?
              </button>
            ) : null}

            {error ? <p className="text-sm text-amber">{error}</p> : null}
            {notice ? <p className="text-sm text-signal">{notice}</p> : null}

            <Button type="submit" className="mt-1 w-full" disabled={busy}>
              {mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </Button>
          </form>

          {mode === "signin" ? (
            <p className="mt-4 text-sm text-quiet">
              No account?{" "}
              <button
                type="button"
                className={cn("text-harmattan hover:text-amber")}
                onClick={() => {
                  resetForm();
                  onModeChange("signup");
                }}
              >
                Sign up
              </button>
            </p>
          ) : null}
          {mode === "signup" ? (
            <p className="mt-4 text-sm text-quiet">
              Already have an account?{" "}
              <button
                type="button"
                className="text-harmattan hover:text-amber"
                onClick={() => {
                  resetForm();
                  onModeChange("signin");
                }}
              >
                Sign in
              </button>
            </p>
          ) : null}
          {mode === "forgot" ? (
            <p className="mt-4 text-sm text-quiet">
              <button
                type="button"
                className="text-harmattan hover:text-amber"
                onClick={() => {
                  resetForm();
                  onModeChange("signin");
                }}
              >
                Back to sign in
              </button>
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
