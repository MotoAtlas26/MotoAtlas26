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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-map': ['leaflet', '@react-leaflet/core', 'react-leaflet'],
          'vendor-db': ['dexie'],
          'vendor-router': ['react-router-dom'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
})