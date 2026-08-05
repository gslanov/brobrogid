import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

const POIS_PATH = path.resolve(__dirname, 'public/content/pois.json')

function adminApiPlugin() {
  return {
    name: 'admin-api',
    configureServer(server: import('vite').ViteDevServer) {
      // Синхронизация всех POI из браузера в файл
      server.middlewares.use('/api/sync-pois', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const pois = JSON.parse(body)
            fs.writeFileSync(POIS_PATH, JSON.stringify(pois, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, count: pois.length }))
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
        })
      })
      server.middlewares.use('/api/poi', (req, res, next) => {
        if (req.method === 'DELETE') {
          const id = (req.url ?? '').replace(/^\/+/, '').split('?')[0]
          try {
            const pois: unknown[] = JSON.parse(fs.readFileSync(POIS_PATH, 'utf-8'))
            const filtered = (pois as Array<{ id: string }>).filter(p => p.id !== id)
            fs.writeFileSync(POIS_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, deleted: id }))
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
          return
        }
        if (req.method !== 'PUT') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const updated = JSON.parse(body)
            const pois: unknown[] = JSON.parse(fs.readFileSync(POIS_PATH, 'utf-8'))
            const idx = (pois as Array<{ id: string }>).findIndex((p) => p.id === updated.id)
            if (idx === -1) { res.statusCode = 404; res.end('Not found'); return }
            pois[idx] = updated
            fs.writeFileSync(POIS_PATH, JSON.stringify(pois, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    adminApiPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/**/*'],
      manifest: {
        name: 'BROBROGID — Гид по Владикавказу',
        short_name: 'BROBROGID',
        description: 'Путеводитель по Владикавказу и Северной Осетии',
        theme_color: '#E85D26',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: null,  // CRITICAL: не перехватывать навигации, дать nginx отдать prerendered HTML
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
          {
            urlPattern: /\/content\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'content-data' },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
