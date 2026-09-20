import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileDbPlugin } from './vite-plugin-file-db';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fileDbPlugin()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'excel-vendor': ['xlsx'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'icons-vendor': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
