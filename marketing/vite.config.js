import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ✨ 確保這段程式碼完全正確
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // 後端伺服器位址
        changeOrigin: true, // 允許跨域
      },
    },
  },
})