import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'mortgage-calculator' with your exact repository name
export default defineConfig({
  plugins: [react()],
  base: '/mortgage-calculator/',
})
