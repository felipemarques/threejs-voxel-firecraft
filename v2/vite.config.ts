import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages
  // Local dev = '/', Production = '/threejs-voxel-firecraft/'
  base: process.env.NODE_ENV === 'production' ? '/threejs-voxel-firecraft/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Output to dist for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
