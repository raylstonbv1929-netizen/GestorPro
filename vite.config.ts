import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts'],
          'vendor-core': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          'vendor-db': ['@supabase/supabase-js'],
        }
      }
    }
  }
}));
