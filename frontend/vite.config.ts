import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const devApiProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: devApiProxyTarget
    ? {
        proxy: {
          '/api': {
            target: devApiProxyTarget,
            changeOrigin: true,
          },
        },
      }
    : undefined,
  build: {
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
