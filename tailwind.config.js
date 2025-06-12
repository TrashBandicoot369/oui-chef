/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary1: 'var(--color-primary1, #F13F27)',
        primary2: 'var(--color-primary2, #FFF042)',
        primary3: 'var(--color-primary3, #FFD230)',
        accent1: 'var(--color-accent1, #6C1234)',
        accent2: 'var(--color-accent2, #F56F4C)',
        stroke: 'var(--color-stroke, #F13F27)'
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        sans: ["var(--font-sans)", "sans-serif"],
        button: ["var(--font-button)", "sans-serif"],
      },
     
      animation: {
        // 20 s feels buttery; tweak if you want faster/slower
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [],
} 