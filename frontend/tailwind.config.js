/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // enable dark mode manually
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F5ECD7',
          DEFAULT: '#C9A84C', // Gold accent
          dark: '#9A7B30',
        },
        dark: {
          bg: '#0C0C0C',
          card: '#161616',
          border: '#2A2A2A',
          text: '#F0EDE6',
          muted: '#888888',
        },
        light: {
          bg: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E8E8E3',
          text: '#1A1A1A',
          muted: '#6B6B6B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'luxury-dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        }
      },
      animation: {
        scaleIn: 'scaleIn 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
