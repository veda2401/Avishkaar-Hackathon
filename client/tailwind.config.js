/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F855A', // Green-700
        secondary: '#C05621', // Orange-700
        accent: '#F6E05E', // Yellow-400
      }
    },
  },
  plugins: [],
}
