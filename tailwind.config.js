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

        // ---- Brand (static) — GT Medical navy + maroon ----
        navy: {
          50: "#eef2fb", 100: "#d5def5", 200: "#aebfe9", 300: "#7d97d7",
          400: "#4d6cc0", 500: "#2a4da6", 600: "#0B2D7A", 700: "#071D5A",
          800: "#06163f", 900: "#040e29", 950: "#020817",
        },
        accent: {
          50: "#eef2fb", 100: "#d5def5", 200: "#aebfe9", 300: "#7d97d7",
          400: "#4d6cc0", 500: "#2a4da6", 600: "#0B2D7A", 700: "#071D5A",
          800: "#06163f", 900: "#040e29",
          DEFAULT: "#0B2D7A",
        },
        maroon: {
          50: "#fbeaeb", 100: "#f5cccd", 200: "#e89a9d", 300: "#d96067",
          400: "#c23740", 500: "#A61D24", 600: "#7A0E12", 700: "#5e0a0d",
          800: "#420709", 900: "#2b0405",
          DEFAULT: "#7A0E12",
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
        glow: "0 0 0 1px rgb(11 45 122 / 0.18), 0 8px 24px -8px rgb(11 45 122 / 0.40)",
        "glow-maroon": "0 0 0 1px rgb(122 14 18 / 0.18), 0 8px 24px -10px rgb(122 14 18 / 0.45)",
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
