import puppeteer from 'puppeteer'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'

const DIST = join(process.cwd(), 'dist')
const PORT = 4567
const CONCURRENCY = 5
const BASE = `http://localhost:${PORT}`

// Simple static file server for dist/
function startServer(): Promise<ReturnType<typeof createServer>> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url || '/'
      let filePath = join(DIST, url)

      // Try exact file, then index.html, then SPA fallback
      try {
        const stat = statSync(filePath)
        if (stat.isDirectory()) filePath = join(filePath, 'index.html')
      } catch {
        // Try with .html extension or fallback to SPA index
        if (!filePath.includes('.')) {
          filePath = join(DIST, 'index.html')
        }
      }

      try {
        const content = readFileSync(filePath)
        const ext = filePath.split('.').pop() || ''
        const mimeTypes: Record<string, string> = {
          html: 'text/html', js: 'application/javascript', css: 'text/css',
          json: 'application/json', png: 'image/png', jpg: 'image/jpeg',
          svg: 'image/svg+xml', webp: 'image/webp', webmanifest: 'application/manifest+json',
          woff2: 'font/woff2', ico: 'image/x-icon',
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
        res.end(content)
      } catch {
        // SPA fallback
        try {
          const index = readFileSync(join(DIST, 'index.html'))
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(index)
        } catch {
          res.writeHead(404)
          res.end('Not found')
        }
      }
    })
    server.listen(PORT, () => resolve(server))
  })
}

// Build URL list from content JSON
function buildUrlList(): string[] {
  const urls: string[] = [
    '/',
    '/map',
    '/tours',
    '/emergency',
    '/search',
    '/subscription',
  ]

  try {
    const pois = JSON.parse(readFileSync(join(DIST, 'content/pois.json'), 'utf-8'))
    for (const poi of pois) {
      urls.push(`/poi/${poi.id}`)
      if (poi.hasMenu) urls.push(`/poi/${poi.id}/menu`)
    }
  } catch (e) { console.warn('Could not read pois.json:', e) }

  try {
    const tours = JSON.parse(readFileSync(join(DIST, 'content/tours.json'), 'utf-8'))
    for (const tour of tours) urls.push(`/tours/${tour.id}`)
  } catch (e) { console.warn('Could not read tours.json:', e) }

  try {
    const guides = JSON.parse(readFileSync(join(DIST, 'content/guides.json'), 'utf-8'))
    for (const guide of guides) urls.push(`/tours/guide/${guide.id}`)
  } catch (e) { console.warn('Could not read guides.json:', e) }

  return urls
}

async function prerenderUrl(browser: puppeteer.Browser, url: string): Promise<void> {
  const page = await browser.newPage()
  try {
    // Bypass onboarding redirect
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('brobrogid_onboarding', 'true')
    })

    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0', timeout: 30000 })

    // Wait for actual render (not loading spinner)
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#root')
        if (!root || root.children.length === 0) return false
        // Check no loading spinner
        if (document.querySelector('.animate-spin')) return false
        return true
      },
      { timeout: 15000 }
    )

    // Small delay for final React state updates
    await new Promise(r => setTimeout(r, 500))

    const html = await page.content()

    // Write to dist/{path}/index.html
    const outputPath = url === '/'
      ? join(DIST, 'index.html')
      : join(DIST, url, 'index.html')

    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, html, 'utf-8')
    console.log(`✓ ${url}`)
  } catch (err) {
    console.error(`✗ ${url}:`, (err as Error).message)
  } finally {
    await page.close()
  }
}

async function main() {
  console.log('Starting prerender...')
  const server = await startServer()
  console.log(`Server running on port ${PORT}`)

  const urls = buildUrlList()
  console.log(`Found ${urls.length} URLs to prerender`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(url => prerenderUrl(browser, url)))
  }

  await browser.close()
  server.close()
  console.log(`\nPrerender complete: ${urls.length} pages`)
}

main().catch(console.error)
