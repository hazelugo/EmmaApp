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
        // Precache only small/medium assets — JS, CSS, HTML, icons, SFX PNGs, fonts
        // Large battle PNGs and theme MP3s are handled by runtime caching below
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],

        // Runtime caching: serves large assets from cache after first load
        runtimeCaching: [
          // Large battle/cutscene PNGs — CacheFirst, keep up to 120 images
          {
            urlPattern: /\/assets\/.*\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'emma-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Theme MP3 files — CacheFirst, keep all 5 tracks
          {
            urlPattern: /\/assets\/.*\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'emma-audio',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Google Fonts
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
