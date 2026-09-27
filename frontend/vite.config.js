import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/datasets': 'http://localhost:8000',
      '/run-matching': 'http://localhost:8000',
      '/validate': 'http://localhost:8000',
      '/results': 'http://localhost:8000',
      '/candidates': 'http://localhost:8000',
      '/metrics': 'http://localhost:8000',
    },
  },
});
