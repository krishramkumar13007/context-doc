import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#fbfaf8",
        line: "#dedbd4",
        moss: "#316857",
        amber: "#b7791f",
        coral: "#b84a40"
      }
    }
  },
  plugins: []
};

export default config;

