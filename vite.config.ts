import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => {
  const appBase = command === 'build' ? '/what-to-eat/' : '/'

  return {
    base: appBase,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: 'what to eat',
          short_name: 'What to Eat',
          description: '本地优先的晚餐选择与采购清单助手',
          theme_color: '#fff7e9',
          background_color: '#fff7e9',
          display: 'standalone',
          orientation: 'portrait',
          start_url: `${appBase}#/`,
          scope: appBase,
          lang: 'zh-CN',
          icons: [
            { src: `${appBase}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: `${appBase}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: `${appBase}icons/icon-maskable.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
          ]
        },
        workbox: {
          navigateFallback: `${appBase}index.html`,
          globPatterns: ['**/*.{js,css,html,svg,ico,png,webp,woff2}'],
          cleanupOutdatedCaches: true
        }
      })
    ]
  }
})
