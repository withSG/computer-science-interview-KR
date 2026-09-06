import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API = 'http://127.0.0.1:' + (process.env.PORT || 5174)

export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: API, changeOrigin: true } },
  },
  build: { outDir: 'dist', emptyOutDir: true },
})
