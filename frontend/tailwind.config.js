/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is toggled by a `dark` class on <html> (managed by themeStore),
  // which lets us support an explicit Light / Dark / Auto choice.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sumly brand palette — a fresh emerald/teal for a modern money feel.
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      boxShadow: {
        // Soft elevation used by cards and the floating add button.
        soft: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        lifted: '0 8px 24px rgba(5, 150, 105, 0.25)',
      },
    },
  },
  plugins: [],
};
