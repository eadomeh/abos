/** Hex copies of the CSS tokens — for canvas/WebGL only. DOM uses Tailwind tokens. */
export const BRAND = {
  onyx: "#04080A",
  charcoal: "#081014",
  signal: "#6EE7B7",
  amber: "#FBBF24",
  violet: "#A78BFA",
  harmattan: "#F8FFFC",
} as const;

export type BrandColor = (typeof BRAND)[keyof typeof BRAND];
