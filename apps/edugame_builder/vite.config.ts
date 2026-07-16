import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
      root: __dirname,
      base: '/edugame_builder/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: '../../public/edugame_builder',
        emptyOutDir: true,
      },
});
