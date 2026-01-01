/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        slate: "rgb(var(--slate) / <alpha-value>)",
        fog: "rgb(var(--fog) / <alpha-value>)",
        sand: "rgb(var(--sand) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentSoft: "rgb(var(--accent-soft) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        goldSoft: "rgb(var(--gold-soft) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        warningSoft: "rgb(var(--warning-soft) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"]
      },
      boxShadow: {
        card: "0 14px 34px rgba(15, 23, 42, 0.1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        sheen: {
          "0%": { transform: "translateX(-140%)" },
          "100%": { transform: "translateX(140%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "soft-float": "soft-float 6s ease-in-out infinite",
        sheen: "sheen 2.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
