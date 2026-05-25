import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Palette Cyber-Terminal ───────────────────────────────────────────
      colors: {
        bg: {
          primary: "#0D1117",    // Fond principal
          card: "#161B22",       // Fond des cartes
          elevated: "#1C2128",   // Éléments surélevés
        },
        border: {
          DEFAULT: "#21262D",    // Bordures standard
          active: "#30363D",     // Bordures actives
          glow: "#388BFD",       // Bordures focus (bleu cyber)
        },
        neon: {
          green: "#00E676",      // Gains
          red: "#FF5252",        // Pertes
          blue: "#388BFD",       // Accent primaire
          yellow: "#F0C040",     // Alertes
        },
        text: {
          primary: "#E6EDF3",    // Texte principal
          secondary: "#8B949E",  // Texte secondaire
          muted: "#484F58",      // Texte désactivé
        },
      },
      // ── Typographie ────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      // ── Animations ─────────────────────────────────────────────────────
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "glow": "glow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 5px #00E676, 0 0 10px #00E67640" },
          "50%": { boxShadow: "0 0 20px #00E676, 0 0 40px #00E67660" },
        },
        slideIn: {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        glow: {
          from: { textShadow: "0 0 8px #00E67680" },
          to: { textShadow: "0 0 16px #00E676, 0 0 30px #00E67640" },
        },
      },
      // ── Ombres Cyber ──────────────────────────────────────────────────
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px #30363D",
        "neon-green": "0 0 12px #00E67650, 0 0 24px #00E67620",
        "neon-red": "0 0 12px #FF525250, 0 0 24px #FF525220",
        "neon-blue": "0 0 12px #388BFD50",
        "glow-input": "0 0 0 2px #388BFD40",
      },
      // ── Grilles ────────────────────────────────────────────────────────
      gridTemplateColumns: {
        "7": "repeat(7, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;