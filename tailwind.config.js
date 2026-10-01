/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Clash Display", "Avenir Next", "Segoe UI", "sans-serif"],
        sans: ["General Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
      colors: {
        onyx: "#04080a",
        charcoal: "#081014",
        signal: "#6ee7b7",
        amber: "#fbbf24",
        violet: "#a78bfa",
        harmattan: "#f8fffc",
        "harmattan-muted": "#94a3b8",
        quiet: "#64748b",
        "primary-foreground": "#03100a",
        accent: "#34d399",
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
          "clamp(2.75rem, 1rem + 6.2vw, 5.5rem)",
          { lineHeight: "0.96" },
        ],
        title: [
          "clamp(1.7rem, 1.15rem + 2.1vw, 2.9rem)",
          { lineHeight: "1.12" },
        ],
        lede: [
          "clamp(1.05rem, 0.96rem + 0.4vw, 1.2rem)",
          { lineHeight: "1.55" },
        ],
      },
    },
  },
  plugins: [],
};
