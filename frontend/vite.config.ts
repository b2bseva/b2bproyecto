import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Necesitarás esta importación

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Es mejor práctica apuntar a src
    },
  },
})