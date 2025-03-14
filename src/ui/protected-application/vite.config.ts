import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3010,
  },
  base: './',
  build: {
    outDir: '../../../dist/src/ui/protected-application',
    emptyOutDir: true
  }
})
