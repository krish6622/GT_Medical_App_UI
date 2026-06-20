/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Medical brand palette
        primary: {
          50: "#e8f1fb", 100: "#c9ddf5", 200: "#94bbeb", 300: "#5e98e0",
          400: "#357dd8", 500: "#1565C0", 600: "#1259ac", 700: "#0e4587",
          800: "#0a3263", 900: "#061f3e",
        },
        accent: {
          50: "#e9f7ef", 100: "#c6ebd5", 200: "#8fd7ab", 300: "#57c382",
          400: "#2faf63", 500: "#1f9d52", 600: "#198044", 700: "#136234",
          800: "#0d4524", 900: "#062714",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04)",
      },
    },
  },
  plugins: [],
};
