import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "--color-secondary",
      accent: "var(--color-third)",
      background: "var(--color-gray-1)",
      textPrimary: "var(--color-text-primary)",
      textSecondary: "var(--color-text-secondary)",
      textHover: "var(--color-text-hover)",
      border: "var(--color-border)",
      placeholder: "var(--color-placeholder)",
      danger: "var(--color-dander)",
      white: "var(--color-white)",
    },
    extend: {
      fontSize: {
        xs: "12px",
        sm: "14px",
        md: "17px",
        lg: "30px",
        xl: "40px",
      },
      fontWeight: {
        regular: "400",
        semiBold: "600",
        extraBold: "800",
      },
      keyframes: {
        appear: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        appear: "appear 0.5s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
