import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DIST = join(process.cwd(), 'dist')
const BASE_URL = 'https://brobrogid.ru'

interface SitemapEntry {
  loc: string
  changefreq: string
  priority: number
}

function buildEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/tours', changefreq: 'weekly', priority: 0.9 },
    { loc: '/map', changefreq: 'monthly', priority: 0.9 },
    { loc: '/emergency', changefreq: 'monthly', priority: 0.5 },
    { loc: '/search', changefreq: 'monthly', priority: 0.5 },
    { loc: '/subscription', changefreq: 'monthly', priority: 0.5 },
  ]

  try {
    const pois = JSON.parse(readFileSync(join(DIST, 'content/pois.json'), 'utf-8'))
    for (const poi of pois) {
      entries.push({ loc: `/poi/${poi.id}`, changefreq: 'monthly', priority: 0.8 })
      if (poi.hasMenu) entries.push({ loc: `/poi/${poi.id}/menu`, changefreq: 'monthly', priority: 0.6 })
    }
  } catch {}

  try {
    const tours = JSON.parse(readFileSync(join(DIST, 'content/tours.json'), 'utf-8'))
    for (const tour of tours) entries.push({ loc: `/tours/${tour.id}`, changefreq: 'monthly', priority: 0.7 })
  } catch {}

  try {
    const guides = JSON.parse(readFileSync(join(DIST, 'content/guides.json'), 'utf-8'))
    for (const guide of guides) entries.push({ loc: `/tours/guide/${guide.id}`, changefreq: 'monthly', priority: 0.7 })
  } catch {}

  return entries
}

function generateXml(entries: SitemapEntry[]): string {
  const urls = entries.map(e => `  <url>
    <loc>${BASE_URL}${e.loc}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

const entries = buildEntries()
writeFileSync(join(DIST, 'sitemap.xml'), generateXml(entries), 'utf-8')
console.log(`Sitemap generated: ${entries.length} URLs`)
