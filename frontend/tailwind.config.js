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
      fontFamily: {
        // Distinctive geometric display face (covers Latin Ext + Cyrillic, so
        // English, Uzbek and Russian all render in-family) paired with a clean
        // body face. Scoped to the landing via `font-body` / `font-display`.
        display: ['Unbounded', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Soft elevation used by cards and the floating add button.
        soft: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        lifted: '0 8px 24px rgba(5, 150, 105, 0.25)',
        // Deep, diffuse glow for the marketing demo panel.
        glow: '0 30px 80px -20px rgba(5, 150, 105, 0.45)',
      },
      keyframes: {
        // Slowly drifting blobs behind the hero create a living aurora.
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -3%) scale(1.12)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Receipt-scan sweep line. Uses transform (GPU-composited, no per-frame
        // layout/paint) on a full-height overlay so the line travels top→bottom.
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        // Bars growing from the baseline in the demo chart.
        growbar: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        // Subtle marquee for the trust strip.
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        aurora: 'aurora 20s ease-in-out infinite',
        'aurora-slow': 'aurora 28s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        scan: 'scan 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        growbar: 'growbar 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
