import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injection sécurisée de la clé API pour l'environnement de production
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000, // Augmenté à 3000 pour supprimer définitivement l'avertissement
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        manualChunks: {
          // Séparation des grosses bibliothèques pour optimiser le chargement
          vendor: ['react', 'react-dom', 'lucide-react', 'recharts'],
        },
      },
    },
  }
});
