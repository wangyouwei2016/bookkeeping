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
      },
      // 移动端优化尺寸（基于 16px 基准）
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
        '32': '8rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}