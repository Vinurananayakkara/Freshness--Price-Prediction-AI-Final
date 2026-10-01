/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Original market-stall palette (kept for backward compat) ──
        ground: "#12241D",
        stall: "#1B3229",
        stallLine: "#2C4A3C",
        paper: "#F3EFE2",
        sage: "#B9C4BB",
        turmeric: "#E8A33D",
        turmericDeep: "#B9791F",
        leaf: "#7FB56E",
        leafDeep: "#3F6B33",
        chili: "#D8562F",
        chiliDeep: "#8C3117",

        // ── Ledger theme tokens ── used throughout JSX components ──
        "ledger-bg":     "#12241D",   // dark green background
        "ledger-panel":  "#1B3229",   // slightly lighter panel
        "ledger-line":   "#2C4A3C",   // divider / border
        "ledger-paper":  "#F3EFE2",   // warm off-white text
        "ledger-gold":   "#E8A33D",   // turmeric/amber accent
        "ledger-fresh":  "#7FB56E",   // green — fresh verdict
        "ledger-rotten": "#D8562F",   // red-orange — rotten verdict
        "ledger-muted":  "#B9C4BB",   // muted sage for secondary text
      },
      fontFamily: {
        serif:   ["Fraunces", "Georgia", "serif"],
        display: ["Fraunces", "Georgia", "serif"],
        body:    ["Public Sans", "Inter", "sans-serif"],
        sans:    ["Public Sans", "Inter", "sans-serif"],
        mono:    ["IBM Plex Mono", "Menlo", "monospace"],
      },
      animation: {
        "stamp-down": "stamp-down 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        "fade-up":    "fade-up 400ms ease-out both",
      },
      keyframes: {
        "stamp-down": {
          "0%":   { transform: "rotate(-4deg) scale(1.6)", opacity: "0" },
          "60%":  { opacity: "1" },
          "100%": { transform: "rotate(-4deg) scale(1)", opacity: "1" },
        },
        "fade-up": {
          "0%":   { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
