import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Required for Ngrok or external access
allowedHosts: [
  '9532-2401-f7e0-1-3c76-28f1-8c8a-a3fa-2416.ngrok-free.app'
], // Accept all hosts (e.g., ngrok URLs)
    proxy: {
      '/api': {
        target: 'http://ec2-43-204-114-19.ap-south-1.compute.amazonaws.com:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
