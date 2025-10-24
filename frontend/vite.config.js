import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/clients': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/quotations': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/sales': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/rentals': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/suppliers': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/inventory': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
      '/organizations': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      }
    }
  }
})
