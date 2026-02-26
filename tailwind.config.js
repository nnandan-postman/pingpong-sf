/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        postman: {
          DEFAULT: "#FF6C37",
          light: "#FF8C5A",
          dark: "#E5572A",
        },
      },
    },
  },
  plugins: [],
};
