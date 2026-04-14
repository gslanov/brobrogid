#!/usr/bin/env node
/**
 * Sitemap generator for brobrogid.ru
 *
 * Reads public/content/{pois,tours,guides}.json and produces:
 *   public/sitemap.xml         (index)
 *   public/sitemap-pages.xml   (static pages / hubs)
 *   public/sitemap-pois.xml
 *   public/sitemap-tours.xml
 *   public/sitemap-guides.xml
 *
 * Filters items by _meta.editorialStatus -- only `published` and `needs_update`
 * are included. If the field is absent, the item is included for now.
 * TODO: once content gets _meta.editorialStatus everywhere, make the filter
 * strict (drop items without editorialStatus).
 */

import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const CONTENT_DIR = join(PUBLIC_DIR, 'content')

const BASE_URL = 'https://brobrogid.ru'

// ----- helpers -----

function readJson(file) {
  const p = join(CONTENT_DIR, file)
  if (!existsSync(p)) return { data: [], mtime: new Date() }
  const raw = readFileSync(p, 'utf-8')
  const mtime = statSync(p).mtime
  return { data: JSON.parse(raw), mtime }
}

function isPublished(item) {
  const status = item?._meta?.editorialStatus
  // TODO: when editorialStatus is populated everywhere, drop the `undefined` pass-through.
  if (status === undefined) return true
  return status === 'published' || status === 'needs_update'
}

function pickLastmod(item, fallback) {
  const candidates = [
    item?._meta?.updatedAt,
    item?.updatedAt,
    item?.updated_at,
    item?._meta?.publishedAt,
    item?.publishedAt,
  ]
  for (const c of candidates) {
    if (!c) continue
    const d = new Date(c)
    if (!Number.isNaN(d.getTime())) return d
  }
  return fallback
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlset(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${xmlEscape(BASE_URL + u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

function buildIndex(files, lastmod) {
  const body = files
    .map(
      (f) => `  <sitemap>
    <loc>${BASE_URL}/${f}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`
}

function write(name, content) {
  const out = join(PUBLIC_DIR, name)
  writeFileSync(out, content, 'utf-8')
  return out
}

// ----- sources -----

const pois = readJson('pois.json')
const tours = readJson('tours.json')
const guides = readJson('guides.json')

const today = isoDate(new Date())

// ----- static pages / hubs -----
// TODO: when semantic hub URLs (L1-L16) land, extend this list.
const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/tours', changefreq: 'weekly', priority: 0.9 },
  { loc: '/map', changefreq: 'monthly', priority: 0.9 },
  { loc: '/emergency', changefreq: 'monthly', priority: 0.5 },
].map((p) => ({ ...p, lastmod: today }))

// ----- POIs -----
function poiPriority(poi) {
  const cat = poi.category
  if (['attractions', 'culture', 'food', 'accommodation', 'nature'].includes(cat)) return 0.8
  if (['shopping', 'nightlife'].includes(cat)) return 0.6
  if (cat === 'practical') return 0.5
  return 0.6
}

const poiUrls = pois.data.filter(isPublished).map((poi) => ({
  loc: `/poi/${poi.id}`,
  lastmod: isoDate(pickLastmod(poi, pois.mtime)),
  changefreq: 'monthly',
  priority: poiPriority(poi),
}))

// Menu sub-pages
for (const poi of pois.data.filter(isPublished)) {
  if (poi.hasMenu) {
    poiUrls.push({
      loc: `/poi/${poi.id}/menu`,
      lastmod: isoDate(pickLastmod(poi, pois.mtime)),
      changefreq: 'monthly',
      priority: 0.5,
    })
  }
}

// ----- tours -----
const tourUrls = tours.data.filter(isPublished).map((tour) => ({
  loc: `/tours/${tour.id}`,
  lastmod: isoDate(pickLastmod(tour, tours.mtime)),
  changefreq: 'weekly',
  priority: 0.9,
}))

// ----- guides -----
const guideUrls = guides.data.filter(isPublished).map((guide) => ({
  loc: `/tours/guide/${guide.id}`,
  lastmod: isoDate(pickLastmod(guide, guides.mtime)),
  changefreq: 'monthly',
  priority: 0.7,
}))

// ----- write child sitemaps -----
write('sitemap-pages.xml', buildUrlset(staticPages))
write('sitemap-pois.xml', buildUrlset(poiUrls))
write('sitemap-tours.xml', buildUrlset(tourUrls))
write('sitemap-guides.xml', buildUrlset(guideUrls))

// ----- index -----
write(
  'sitemap.xml',
  buildIndex(
    ['sitemap-pages.xml', 'sitemap-pois.xml', 'sitemap-tours.xml', 'sitemap-guides.xml'],
    today
  )
)

// ----- report -----
console.log('[sitemap] written to public/:')
console.log(`  sitemap.xml           (index)`)
console.log(`  sitemap-pages.xml     ${staticPages.length} urls`)
console.log(`  sitemap-pois.xml      ${poiUrls.length} urls`)
console.log(`  sitemap-tours.xml     ${tourUrls.length} urls`)
console.log(`  sitemap-guides.xml    ${guideUrls.length} urls`)
console.log(`  total: ${staticPages.length + poiUrls.length + tourUrls.length + guideUrls.length}`)
