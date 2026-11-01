import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        meridian: {
          bg: "#0A0D08",
          panel: "#11150E",
          panelHover: "#171D13",
          primary: "#7A9A6E",
          secondary: "#C4B99A",
          accent: "#C4B99A",
          surface: "#C4B99A",
          textPrimary: "#FFFFFF",
          textSecondary: "#A1A1AA",
          border: "#27272A",
        },
        ink: "#17212B",
        cool: { 50: "#effbff", 500: "#7A9A6E", 700: "#5d7853" },
        warm: { 50: "#fff7ed", 500: "#C4B99A", 700: "#9e9273" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "18px",
        control: "17px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0, 0, 0, 0.45)",
        panel: "0 16px 40px -12px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        glow: "0 0 28px rgba(122, 154, 110, 0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        maskReveal: {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "mask-reveal": "maskReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
