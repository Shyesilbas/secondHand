import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('react-router-dom')) return 'vendor-router'
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-chart'
          if (id.includes('@stomp/stompjs')) return 'vendor-stomp'

          return 'vendor-misc'
        },
      },
    },
  },
})
