import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/MotoAtlas26/',
  resolve: {
    alias: {
      '@': '/Users/salvadorcruz/Develop/ProyectosIA/MotoLog/src',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})