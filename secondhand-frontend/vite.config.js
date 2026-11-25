import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'chartjs';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-react';
            }
            if (id.includes('@tanstack/')) {
              return 'tanstack-query';
            }
            if (id.includes('i18next')) {
              return 'i18n';
            }
            if (id.includes('/axios/') || id.includes('@stomp/stompjs')) {
              return 'network-realtime';
            }
            if (
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/scheduler/') ||
              id.includes('/node_modules/react/')
            ) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
