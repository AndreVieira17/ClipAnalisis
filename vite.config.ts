import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Remotion lives in /remotion as an isolated sub-project and must NEVER enter the
// app bundle. We only ship the rendered <video> from /public.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // the `three` chunk is intentionally large but lazy-loaded (Camada B only),
    // so it never enters the initial paint — don't warn on it.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack out of the initial chunk. It is lazy-loaded
        // via React.lazy in the Hero, this just guarantees a clean split.
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('framer-motion')) return 'motion';
        },
      },
    },
  },
});
