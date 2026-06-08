import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration. During local `npm run dev` we proxy /api to the Go
// backend so the frontend can use same-origin relative URLs (the same paths
// that work in production behind nginx).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
