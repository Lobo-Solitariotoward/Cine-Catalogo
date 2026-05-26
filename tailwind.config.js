/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#f5c518', dim: '#c9a227', light: '#ffd94d' },
        cyan: { DEFAULT: '#00d4ff', dim: '#0099cc', dark: '#006680' },
        blue: { DEFAULT: '#1a6cff', dim: '#1255cc' },
        bg: { DEFAULT: '#080808', 2: '#0e0e0e' },
        surface: { DEFAULT: '#141414', 2: '#1c1c1c', 3: '#242424' },
      },
      fontFamily: {
        display: ['Clash Display', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #f5c518, #c9a227)',
        'gradient-cyan': 'linear-gradient(135deg, #00d4ff, #1a6cff)',
        'gradient-hero': 'linear-gradient(to top, #080808 0%, #080808 10%, transparent 60%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(245,197,24,0.25)',
        'gold-lg': '0 8px 32px rgba(245,197,24,0.3)',
        'cyan': '0 0 20px rgba(0,212,255,0.25)',
        'cyan-lg': '0 8px 32px rgba(0,212,255,0.2)',
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}