/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,tsx}"],
  theme: {
    extend: {},
    fontSize: {
      // 10px
      xs: "0.625rem",
      // 12px
      sm: "0.75rem",
      // 14px
      base: "0.875rem",
      // 16px
      lg: "1rem",
      xl: "1.125rem",
      "2xl": "1.25rem",
      "3xl": "1.5rem",
      "4xl": "1.875rem",
      "5xl": "2rem",
    },
  },
  plugins: [],
};
