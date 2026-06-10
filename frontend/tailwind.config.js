/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is toggled by a `dark` class on <html> (managed by themeStore),
  // which lets us support an explicit Light / Dark / Auto choice.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sumly brand palette — a calm green for a money/finance feel.
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
    },
  },
  plugins: [],
};
