import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['face-api.js'],
  },
  build: {
    rollupOptions: {
      external: ['face-api.js'],
      output: {
        globals: {
          'face-api.js': 'faceapi',
        },
      },
    },
  },
})
