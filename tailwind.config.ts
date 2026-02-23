import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          0: "#FFFFFF",
          50: "#FAF7F0",
          100: "#F5F2EC",
          200: "#ECE9E0",
          300: "#D4D2CB",
          400: "#AEABA9",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#0A111A",
        },
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 2px 4px -2px rgba(0,0,0,0.04), 0 2px 4px -1px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
