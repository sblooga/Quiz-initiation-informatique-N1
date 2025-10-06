import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './apps/frontend/index.html',
    './apps/frontend/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          lavender: '#c8c3f9',
          mint: '#c2f5d9',
          peach: '#ffd8c2',
          sky: '#cce4ff',
          rose: '#ffd6eb',
          butter: '#fff4c6'
        }
      }
    }
  },
  plugins: []
};

export default config;
