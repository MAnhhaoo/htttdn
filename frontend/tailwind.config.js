/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // enable dark mode manually
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F5ECD7',
          DEFAULT: '#C9A84C', // Gold accent
          dark: '#B08A2E',
        },
        dark: {
          bg: '#0B110E',
          surface: '#131B17',
          card: '#15201B',
          border: '#223029',
          text: '#F0EDE6',
          muted: '#94A89E',
        },
        light: {
          bg: '#FAF7F2',
          surface: '#F0EFEC',
          card: '#FFFFFF',
          border: '#E5E3DD',
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
