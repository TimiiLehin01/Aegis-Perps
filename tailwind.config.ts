import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void:    "#07090e",
        surface: { DEFAULT: "#0b0e18", 2: "#0e1220", 3: "#111828" },
        dim:     "#182030",
        bright:  "#243050",
        amber:   { DEFAULT: "#f5a623", dim: "#c47d10", glow: "#f5a62340", subtle: "#f5a62312", ring: "#f5a62330" },
        mxe:     { DEFAULT: "#00e5ff", dim: "#00b8cc", subtle: "#00e5ff12", ring: "#00e5ff30" },
        long:    { DEFAULT: "#00e676", subtle: "#00e67612", ring: "#00e67630" },
        short:   { DEFAULT: "#ff1744", subtle: "#ff174412", ring: "#ff174430" },
        primary: "#d8e2f0",
        mid:     "#6a7a9a",
        muted:   "#323d54",
        enc:     { DEFAULT: "#090f1e", border: "#112038" },
      },
      fontFamily: {
        mono:    ["IBM Plex Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      fontSize: {
        "2xs": ["8.5px", { lineHeight: "1.4" }],
        xs:    ["9px",   { lineHeight: "1.4" }],
        sm:    ["10px",  { lineHeight: "1.5" }],
        md:    ["11px",  { lineHeight: "1.5" }],
        base:  ["12px",  { lineHeight: "1.6" }],
        lg:    ["13px",  { lineHeight: "1.5" }],
        xl:    ["15px",  { lineHeight: "1.4" }],
        "2xl": ["18px",  { lineHeight: "1.3" }],
        "3xl": ["22px",  { lineHeight: "1.2" }],
      },
      letterSpacing: {
        label: "0.10em",
        badge: "0.08em",
        wide:  "0.06em",
      },
      gridTemplateColumns: {
        trade:    "240px 1fr 280px",
        "ob-row": "1fr 1fr 1fr",
        "2col":   "1fr 1fr",
      },
      keyframes: {
        shimmer:     { "0%,100%": { transform: "translateX(-100%)" }, "50%": { transform: "translateX(300%)" } },
        encScan:     { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
        scanline:    { "0%,100%": { opacity: "0.03" }, "50%": { opacity: "0.06" } },
        fadeIn:      { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:     { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        slideDown:   { from: { transform: "translateY(0)" }, to: { transform: "translateY(100%)" } },
        ticker:      { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        mpcPulse:    { "0%,100%": { opacity: "0.4", r: "3" }, "50%": { opacity: "1", r: "4.5" } },
        mpcBar:      { "0%": { width: "0%" }, "100%": { width: "100%" } },
        fadeUp:      { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        borderGlow:  { "0%,100%": { borderColor: "#00e5ff30" }, "50%": { borderColor: "#00e5ff80" } },
      },
      animation: {
        shimmer:    "shimmer 2.6s ease-in-out infinite",
        "enc-scan": "encScan 3.2s ease-in-out infinite",
        scanline:   "scanline 6s ease-in-out infinite",
        "fade-in":  "fadeIn 0.25s ease forwards",
        "slide-up": "slideUp 0.32s cubic-bezier(0.16,1,0.3,1) forwards",
        ticker:     "ticker 28s linear infinite",
        "mpc-pulse":"mpcPulse 1.8s ease-in-out infinite",
        "mpc-bar":  "mpcBar 4s ease-in-out forwards",
        "fade-up":  "fadeUp 0.4s ease forwards",
        "border-glow": "borderGlow 2s ease-in-out infinite",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;