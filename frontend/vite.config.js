import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, /api requests are forwarded to the Express backend.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:6000' } },
})
