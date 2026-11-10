/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Tailwind sınıflarının (className) arandığı dosyalar
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
