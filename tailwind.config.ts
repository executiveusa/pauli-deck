import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pauli: {
          bg: "#0a0a0a",
          panel: "#141414",
          border: "#222",
          accent: "#F5A617",
          green: "#34d399",
          red: "#f87171",
          dim: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};
export default config;
