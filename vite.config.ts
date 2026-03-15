import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    // 3. PWA (オフライン対応)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.png'],
      manifest: {
        name: '現場日報レコーダー',
        short_name: '日報',
        description: 'オフラインでも動く現場用日報アプリ',
        theme_color: '#3b82f6', // Tailwindのblue-500付近
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: "any maskable"
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // 全ファイルをキャッシュしてオフライン起動を確実にする
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
  ],
})
