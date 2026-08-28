import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        archive: {
          bg: "#F5E8C8",
          panel: "#FFF7E3",
          card: "#E4C98F",
          line: "#D4B77A",
          text: "#2E2418",
          body: "#5F4A32",
          muted: "#8A7352",
          rose: "#8F5A2A",
          lavender: "#B8873E",
          green: "#6F8A65",
          danger: "#B45A3C"
        }
      }
    },
  },
  plugins: [],
};

export default config;
