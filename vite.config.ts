import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'apps/frontend',
  plugins: [react()],
  server: {
    port: 5173
  },
  test: {
    include: [resolve(__dirname, 'tests/unit/**/*.test.ts')],
    globals: true,
    environment: 'node'
  }
});
