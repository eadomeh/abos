import { usePrefersReducedMotion } from "@/lib/hooks";

export function SplitMoment() {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-6 py-10">
        <p className="text-center font-display text-xl font-semibold tracking-tight text-signal md:text-3xl">
          Forty chats. One agent — all at once.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-24 max-w-[1400px] items-center justify-center px-6 md:h-28"
      role="presentation"
    >
      <p className="sr-only">
        Forty chats at midnight used to mean one reply at a time. With ABOS it
        means one agent handling all of them at once.
      </p>
      <div
        className="relative text-center font-display text-xl font-semibold tracking-tight md:text-3xl"
        aria-hidden="true"
      >
        <span className="split-out block whitespace-nowrap text-harmattan-muted">
          Forty chats. One reply at a time.
        </span>
        <span className="split-in absolute inset-0 block whitespace-nowrap text-signal">
          Forty chats. One agent — all at once.
        </span>
      </div>
    </div>
  );
}
