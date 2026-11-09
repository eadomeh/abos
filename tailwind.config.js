/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  future: {
    // Hover styles apply only on devices that can hover, so taps on phones leave no sticky grey rows.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        display: ["Clash Display", "Avenir Next", "Segoe UI", "sans-serif"],
        sans: ["General Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
      colors: {
        onyx: "#04080a",
        charcoal: "#081014",
        surface: "#0d171d",
        signal: "#6ee7b7",
        "signal-bright": "#34d399",
        "signal-deep": "#059669",
        amber: "#fbbf24",
        violet: "#a78bfa",
        "violet-deep": "#7c3aed",
        harmattan: "#f8fffc",
        "harmattan-muted": "#94a3b8",
        quiet: "#64748b",
        "primary-foreground": "#03100a",
        accent: "#34d399",
        "border-subtle": "rgba(255, 255, 255, 0.07)",
        "border-bright": "rgba(110, 231, 183, 0.28)",
        "wa-bg": "#0b141a",
        "wa-header": "#1f2c34",
        "wa-in": "#1f2c34",
        "wa-out": "#005c4b",
        "wa-text": "#e9edef",
        "wa-meta": "#8696a0",
        "wa-tick": "#53bdeb",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
      },
      fontSize: {
        display: [
          "clamp(2.75rem, 1.2rem + 6.5vw, 6.0rem)",
          { lineHeight: "0.94", letterSpacing: "-0.055em" },
        ],
        title: [
          "clamp(1.85rem, 1.15rem + 2.5vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.045em" },
        ],
        heading: [
          "clamp(1.25rem, 1.05rem + 0.8vw, 1.85rem)",
          { lineHeight: "1.20", letterSpacing: "-0.030em" },
        ],
        lede: [
          "clamp(1.05rem, 0.95rem + 0.4vw, 1.25rem)",
          { lineHeight: "1.60", letterSpacing: "-0.010em" },
        ],
      },
    },
  },
  plugins: [],
};
