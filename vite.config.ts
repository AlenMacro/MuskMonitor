import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the string value
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevent crash if code accesses process.env elsewhere (e.g. libraries)
      'process.env': {}
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            genai: ['@google/genai'],
            utils: ['jspdf', 'lucide-react']
          }
        }
      }
    },
    server: {
      host: true
    }
  };
});