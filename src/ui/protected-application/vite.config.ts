import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3010,
  },
  base: './',
  build: {
    outDir: '../../../dist/src/ui/protected-application',
    emptyOutDir: true
  }
})
