/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Themed tokens (swap via CSS vars for light/dark) ----
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",

        // ---- Brand (static) ----
        navy: {
          50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1",
          400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155",
          800: "#1e293b", 900: "#0f172a", 950: "#020617",
        },
        accent: {
          50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc",
          400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1",
          800: "#075985", 900: "#0c4a6e",
          DEFAULT: "#0ea5e9",
        },
        success: { DEFAULT: "#10b981", soft: "#d1fae5", softdark: "#064e3b" },
        warning: { DEFAULT: "#f59e0b", soft: "#fef3c7", softdark: "#451a03" },
        danger: { DEFAULT: "#ef4444", soft: "#fee2e2", softdark: "#450a0a" },
      },
      fontFamily: {
        sans: ['"Inter"', '"Inter Fallback"', "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { xl: "12px", "2xl": "16px" },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px -8px rgb(15 23 42 / 0.10)",
        soft: "0 2px 8px rgb(15 23 42 / 0.06)",
        pop: "0 12px 40px -12px rgb(15 23 42 / 0.25)",
        glow: "0 0 0 1px rgb(14 165 233 / 0.15), 0 8px 24px -8px rgb(14 165 233 / 0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        "fade-in": "fade-in .25s ease-out",
        "fade-up": "fade-up .35s cubic-bezier(.16,1,.3,1)",
        "scale-in": "scale-in .18s ease-out",
        "slide-in-right": "slide-in-right .28s cubic-bezier(.16,1,.3,1)",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
