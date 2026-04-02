import type { Config } from "tailwindcss";

// In Tailwind v4, most configuration is done in globals.css via @theme.
// This file is kept minimal for compatibility.
const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};

export default config;
