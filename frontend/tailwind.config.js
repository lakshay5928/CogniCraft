/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0E1A",
        surface: "#10162A",
        trace: "#1B2333",
        cyan: {
          DEFAULT: "#3DD9D6",
          dim: "#1F6E6C",
        },
        violet: {
          DEFAULT: "#8B7FFF",
          dim: "#4A4480",
        },
        amber: {
          DEFAULT: "#F2B33D",
        },
        rose: {
          DEFAULT: "#FF6B7A",
        },
        ink: {
          DEFAULT: "#E8EBF2",
          dim: "#8A92A8",
          faint: "#4E5670",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(61, 217, 214, 0.35)",
        "glow-violet": "0 0 20px rgba(139, 127, 255, 0.35)",
        "glow-amber": "0 0 16px rgba(242, 179, 61, 0.3)",
      },
      animation: {
        "pulse-glow": "pulseGlow 1.8s ease-in-out infinite",
        "trace-flow": "traceFlow 1.2s linear infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "rise-in": "riseIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        traceFlow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        riseIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
