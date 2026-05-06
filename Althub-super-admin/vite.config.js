import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sameOrigin = env.VITE_SAME_ORIGIN === 'true' || env.VITE_SAME_ORIGIN === '1';
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:5001';

  const proxy = sameOrigin
    ? {
        '/api': { target: proxyTarget, changeOrigin: true, secure: false },
        '/socket.io': { target: proxyTarget, changeOrigin: true, ws: true, secure: false },
      }
    : undefined;

  return {
    plugins: [react()],
    server: {
      port: 3002,
      strictPort: true,
      open: true,
      proxy,
    },
    build: {
      outDir: 'build',
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
  };
});
