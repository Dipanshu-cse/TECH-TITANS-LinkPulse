import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // SPA fallback: any 404 → index.html (handles /slug routes in dev + preview)
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
})