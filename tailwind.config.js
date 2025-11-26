/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Teal
          600: '#0d9488',
          900: '#134e4a',
        },
        accent: {
          500: '#f43f5e', // Rose for expense
          600: '#e11d48',
        }
      }
    },
  },
  plugins: [],
}