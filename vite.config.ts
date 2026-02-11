import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // On injecte la clé API de l'environnement de build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // On définit process.env comme un objet vide pour éviter les erreurs dans les libs tierces
    'process.env': {}
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  }
});
