import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use process.cwd() to ensure we look in the project root on Vercel
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Safely replace the specific key used in the app
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // We do NOT shim 'process.env': {} here anymore as it can break 
      // libraries checking for process.env.NODE_ENV
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