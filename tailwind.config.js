/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
        fancy: ["Pacifico", "cursive"],
        comic: ['"Comic Sans MS"', "cursive"],
        georgia: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
