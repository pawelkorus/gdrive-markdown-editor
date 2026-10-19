import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'test'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { quietDeps: true },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'test/vitest.setup.ts',
  },
  build: {
    outDir: 'target',
    emptyOutDir: true,
    sourcemap: true,
  },
})
