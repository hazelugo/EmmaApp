import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',          // manual prompt — we control the install UX
      injectRegister: 'auto',

      manifest: {
        name: "Emma's Star World",
        short_name: 'Star World',
        description: 'A fun Nintendo-inspired math game for kids — practice addition, subtraction, multiplication & division!',
        theme_color: '#E52521',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // Precache all JS, CSS, HTML, fonts, and common image types
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,webp}'],

        // Cache Google Fonts with a long-lived CacheFirst strategy
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],

  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.js', 'src/**/__tests__/**/*.test.js'],
    setupFiles: ['src/composables/__tests__/setup.js'],
  },
})
