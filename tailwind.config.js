/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        isot: {
          burgundy: '#B5123A',
          'deep-burgundy': '#7E102B',
          gold: '#E5A51A',
          'gold-light': '#FDF3DC',
          'gold-dark': '#B8820E',
          bg: '#FAFAF8',
          'bg-dark': '#121212',
          'card-dark': '#1E1E1E',
          'border-dark': '#2E2E2E',
          dark: '#171717',
          muted: '#6B7280',
          'light-pink': '#FDF2F4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
