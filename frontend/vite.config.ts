import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Es mejor práctica apuntar a la carpeta 'src'
      '@': path.resolve(__dirname, './src'), 
    },
  },
})