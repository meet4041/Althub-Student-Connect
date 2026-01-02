import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build', // Keeps the output folder name consistent with CRA
  },

  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/, // This matches .js, .jsx, .ts, and .tsx
    exclude: [],
  },
});