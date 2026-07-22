import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '今晚吃什么',
        short_name: '今晚吃什么',
        description: '本地优先的晚餐选择与采购清单助手',
        theme_color: '#fff7e9',
        background_color: '#fff7e9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
        cleanupOutdatedCaches: true
      }
    })
  ]
})
