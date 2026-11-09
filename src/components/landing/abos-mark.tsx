import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  glow?: boolean;
};

/** Official ABOS mark — refined hexagonal crystal from the operating-layer identity. */
export function AbosMark({ className, title = "ABOS", glow = false }: Props) {
  return (
    <img
      src="/abos-mark.svg"
      alt={title}
      width={32}
      height={32}
      className={cn("shrink-0", glow && "drop-shadow-[0_0_18px_rgba(110,231,183,0.45)]", className)}
    />
  );
}

/** Pure inline vector of the Refined Hexagonal Crystal with collision-proof SVG gradient IDs. */
export function AbosMarkVector({ className, title = "ABOS", glow = false }: Props) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ambientId = `cA-ambient-${safeId}`;
  const topId = `cA-top-${safeId}`;
  const leftId = `cA-left-${safeId}`;
  const rightId = `cA-right-${safeId}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={32}
      height={32}
      fill="none"
      aria-label={title}
      role="img"
      className={cn("shrink-0", glow && "drop-shadow-[0_0_18px_rgba(110,231,183,0.45)]", className)}
    >
      <circle cx="32" cy="32" r="28" fill={`url(#${ambientId})`} />
      <rect width="64" height="64" rx="16" fill="#050C0E" stroke="rgba(110,231,183,0.2)" strokeWidth="1" />

      <defs>
        <linearGradient id={topId} x1="32" y1="12" x2="32" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id={leftId} x1="16" y1="21" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={rightId} x1="48" y1="21" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <radialGradient id={ambientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M32 13 L48 22.2 L32 31.5 L16 22.2 Z" fill={`url(#${topId})`} />
      <path d="M16 22.2 L32 31.5 L32 50 L16 40.8 Z" fill={`url(#${leftId})`} />
      <path d="M48 22.2 L32 31.5 L32 50 L48 40.8 Z" fill={`url(#${rightId})`} />

      <path
        d="M32 13 L32 50 M16 22.2 L48 40.8 M48 22.2 L16 40.8"
        stroke="#F8FFFC"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="32" cy="31.5" r="2.5" fill="#F8FFFC" />
    </svg>
  );
}
