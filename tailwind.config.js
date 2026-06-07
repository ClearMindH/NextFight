/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#ffffff',
        gold: '#c9a227',
        'gold-soft': '#c9b896',
        sand: '#f5f2eb',
        muted: '#8b8b8b',
        'muted-warm': '#8a8278',
        'muted-dark': '#5c5c5c',
        card: '#111111',
        surface: '#0c1219',
        border: '#1f1f1f',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-logo)', 'Impact', 'Haettenschweiler', 'Arial Narrow', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
}
