/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Minimalistische Schwarz/Weiß Theme Erweiterungen
      colors: {
        // Keine zusätzlichen Farben - wir bleiben bei Schwarz/Weiß/Grau
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}