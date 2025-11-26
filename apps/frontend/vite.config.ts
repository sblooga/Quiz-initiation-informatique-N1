// apps/frontend/vite.config.ts

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }, // ⚠️ VIRGULE AJOUTÉE ICI !
  // ⚠️ Ajout de la section server pour forcer le port 3000
  server: {
    port: 3000,
    host: true // Optionnel, mais bonne pratique
  }
});

