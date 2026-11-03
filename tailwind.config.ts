import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15222D",
        "ink-muted": "#5B6B74",
        border: "#E3E8EA",
        surface: "#FFFFFF",
        "surface-100": "#F6F8F9",
        accent: "#0E4A57",
        "accent-2": "#6FA3AE",
        positive: "#2E7D32",
        negative: "#C0392B",
        warning: "#C98A1D"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular"]
      }
    }
  },
  plugins: []
};

export default config;
