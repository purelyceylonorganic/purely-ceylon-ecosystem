import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // புதிய version வந்தால் தானாகப் புதுப்பிக்கும்
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'logo/pco-logo.png',
      ],

      manifest: {
        name: 'Purely Ceylon Organic',
        short_name: 'PCO Production',
        description:
          'Premium Sri Lankan organic spices, Ceylon tea and natural products from Purely Ceylon Organic (PCO).',
        theme_color: '#0E4B32',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // பெரிய file-களுக்கு இடம் (route-களைப் பிரித்த பிறகு பெரும்பாலானவை சிறியவை)
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',

        // API, sitemap, robots ஆகியவை ஒருபோதும் cache-இலிருந்து வரக்கூடாது
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
        ],

        // பெரிய படங்களை முன்கூட்டியே cache செய்ய வேண்டாம்
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}', 'pwa-*.png', 'apple-touch-icon.png'],

        runtimeCaching: [
          {
            // Cloudinary product படங்கள்: முதல் முறைக்குப் பிறகு உடனே தெரியும்
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
})