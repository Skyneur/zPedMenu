import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Chemins relatifs pour FiveM
  build: {
    outDir: './dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Éviter les chunks séparés pour FiveM
      }
    }
  }
})
