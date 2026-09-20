import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
