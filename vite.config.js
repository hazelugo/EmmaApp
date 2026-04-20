import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.js', 'src/**/__tests__/**/*.test.js'],
    setupFiles: ['src/composables/__tests__/setup.js'],
  },
})
