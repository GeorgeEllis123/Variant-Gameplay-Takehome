import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5175,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
