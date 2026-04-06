/**
 * BROBROGID — Import existing JSON content into PostgreSQL
 *
 * Usage (from repo root):
 *   DB_URL="postgres://postgres:PASS@localhost:5432/brobrogid" npx tsx supabase/seed/import.ts
 *
 * On the VPS, run inside the postgres container:
 *   docker exec -i brobrogid-postgres psql -U postgres -d brobrogid < data.sql
 *
 * This script reads public/content/*.json, transforms to DB shape, and
 * generates SQL INSERT statements (stdout) or directly applies via pg client.
 */

import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

const CONTENT_DIR = path.join(process.cwd(), 'public/content')

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8'))
}

interface Poi {
  id: string
  slug: string
  name: { ru: string; en: string }
  category: string
  subcategory: string
  cuisineType?: string
  location: { lat: number; lng: number; address: { ru: string; en: string } }
  description: { short: unknown; medium: unknown; full: unknown }
  photos: string[]
  rating: number
  reviewCount: number
  hours?: Record<string, string>
  phone?: string
  website?: string
  priceLevel?: number
  tags: string[]
  isChain: boolean
  subscriptionTier: string
  visitCount: number
  hasMenu: boolean
  hasDelivery: boolean
  externalOrderUrl?: string
}

interface MenuItem {
  id: string
  poiId: string
  name: { ru: string; en: string }
  description: { ru: string; en: string }
  price: number
  currency: string
  category: string
  photo?: string
  isPopular: boolean
  tags: string[]
}

interface Guide {
  id: string
  name: { ru: string; en: string }
  bio: { ru: string; en: string }
  photo: string
  languages: string[]
  rating: number
  reviewCount: number
  tourCount: number
  specializations: string[]
}

interface Tour {
  id: string
  name: { ru: string; en: string }
  description: { ru: string; en: string }
  guideId: string
  price: number
  duration: string
  type: string
  maxGroupSize: number
  currentGroupSize: number
  status: string
  dates: string[]
  meetingPoint: unknown
  route: Array<{ lat: number; lng: number }>
  rating: number
  reviewCount: number
  photos: string[]
  category: string
}

interface Review {
  id: string
  targetType: string
  targetId: string
  authorName: string
  authorAvatar?: string
  rating: number
  text: string
  date: string
  isGenerated: boolean
}

/**
 * Slugify function for generating slugs from Russian names when not provided.
 * Uses a simple transliteration map.
 */
const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function main() {
  const dbUrl = process.env.DB_URL
  if (!dbUrl) {
    console.error('DB_URL environment variable is required')
    process.exit(1)
  }

  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  console.log('Connected to PostgreSQL')

  try {
    await client.query('BEGIN')

    // 1. POIs
    const pois = readJson<Poi[]>('pois.json')
    console.log(`Importing ${pois.length} POIs...`)
    for (const p of pois) {
      await client.query(
        `INSERT INTO pois (
          id, slug, name, category, subcategory, cuisine_type, location, description,
          photos, rating, review_count, hours, phone, website, price_level, tags,
          is_chain, subscription_tier, visit_count, has_menu, has_delivery, external_order_url
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          cuisine_type = EXCLUDED.cuisine_type,
          location = EXCLUDED.location,
          description = EXCLUDED.description,
          photos = EXCLUDED.photos,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          hours = EXCLUDED.hours,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          price_level = EXCLUDED.price_level,
          tags = EXCLUDED.tags,
          is_chain = EXCLUDED.is_chain,
          subscription_tier = EXCLUDED.subscription_tier,
          visit_count = EXCLUDED.visit_count,
          has_menu = EXCLUDED.has_menu,
          has_delivery = EXCLUDED.has_delivery,
          external_order_url = EXCLUDED.external_order_url,
          updated_at = now()`,
        [
          p.id,
          p.slug || slugify(p.name.en || p.name.ru),
          JSON.stringify(p.name),
          p.category,
          p.subcategory || '',
          p.cuisineType || null,
          JSON.stringify(p.location),
          JSON.stringify(p.description),
          p.photos || [],
          p.rating || 0,
          p.reviewCount || 0,
          p.hours ? JSON.stringify(p.hours) : null,
          p.phone || null,
          p.website || null,
          p.priceLevel || null,
          p.tags || [],
          p.isChain || false,
          p.subscriptionTier || 'free',
          p.visitCount || 0,
          p.hasMenu || false,
          p.hasDelivery || false,
          p.externalOrderUrl || null,
        ],
      )
    }
    console.log(`✓ POIs imported`)

    // 2. Menu items
    const menuItems = readJson<MenuItem[]>('menu-items.json')
    console.log(`Importing ${menuItems.length} menu items...`)
    for (const m of menuItems) {
      await client.query(
        `INSERT INTO menu_items (
          id, poi_id, name, description, price, currency, category, photo, is_popular, tags
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          poi_id = EXCLUDED.poi_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          currency = EXCLUDED.currency,
          category = EXCLUDED.category,
          photo = EXCLUDED.photo,
          is_popular = EXCLUDED.is_popular,
          tags = EXCLUDED.tags,
          updated_at = now()`,
        [
          m.id,
          m.poiId,
          JSON.stringify(m.name),
          JSON.stringify(m.description),
          m.price || 0,
          m.currency || 'RUB',
          m.category || '',
          m.photo || null,
          m.isPopular || false,
          m.tags || [],
        ],
      )
    }
    console.log(`✓ Menu items imported`)

    // 3. Guides
    const guides = readJson<Guide[]>('guides.json')
    console.log(`Importing ${guides.length} guides...`)
    for (const g of guides) {
      await client.query(
        `INSERT INTO guides (
          id, slug, name, bio, photo, languages, rating, review_count, tour_count, specializations
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          bio = EXCLUDED.bio,
          photo = EXCLUDED.photo,
          languages = EXCLUDED.languages,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          tour_count = EXCLUDED.tour_count,
          specializations = EXCLUDED.specializations,
          updated_at = now()`,
        [
          g.id,
          slugify(g.name.en || g.name.ru),
          JSON.stringify(g.name),
          JSON.stringify(g.bio),
          g.photo || null,
          g.languages || [],
          g.rating || 0,
          g.reviewCount || 0,
          g.tourCount || 0,
          g.specializations || [],
        ],
      )
    }
    console.log(`✓ Guides imported`)

    // 4. Tours
    const tours = readJson<Tour[]>('tours.json')
    console.log(`Importing ${tours.length} tours...`)
    for (const t of tours) {
      await client.query(
        `INSERT INTO tours (
          id, slug, name, description, guide_id, price, duration, type, max_group_size,
          current_group_size, status, dates, meeting_point, route, rating, review_count,
          photos, category
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          guide_id = EXCLUDED.guide_id,
          price = EXCLUDED.price,
          duration = EXCLUDED.duration,
          type = EXCLUDED.type,
          max_group_size = EXCLUDED.max_group_size,
          current_group_size = EXCLUDED.current_group_size,
          status = EXCLUDED.status,
          dates = EXCLUDED.dates,
          meeting_point = EXCLUDED.meeting_point,
          route = EXCLUDED.route,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          photos = EXCLUDED.photos,
          category = EXCLUDED.category,
          updated_at = now()`,
        [
          t.id,
          slugify(t.name.en || t.name.ru),
          JSON.stringify(t.name),
          JSON.stringify(t.description),
          t.guideId || null,
          t.price || 0,
          t.duration || '',
          t.type || 'walking',
          t.maxGroupSize || 0,
          t.currentGroupSize || 0,
          t.status || 'recruiting',
          t.dates || [],
          JSON.stringify(t.meetingPoint || {}),
          JSON.stringify(t.route || []),
          t.rating || 0,
          t.reviewCount || 0,
          t.photos || [],
          t.category || '',
        ],
      )
    }
    console.log(`✓ Tours imported`)

    // 5. Reviews
    const reviews = readJson<Review[]>('reviews.json')
    console.log(`Importing ${reviews.length} reviews...`)
    for (const r of reviews) {
      await client.query(
        `INSERT INTO reviews (
          id, target_type, target_id, author_name, author_avatar, rating, text, date, is_generated
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO UPDATE SET
          target_type = EXCLUDED.target_type,
          target_id = EXCLUDED.target_id,
          author_name = EXCLUDED.author_name,
          author_avatar = EXCLUDED.author_avatar,
          rating = EXCLUDED.rating,
          text = EXCLUDED.text,
          date = EXCLUDED.date,
          is_generated = EXCLUDED.is_generated`,
        [
          r.id,
          r.targetType,
          r.targetId,
          r.authorName,
          r.authorAvatar || null,
          r.rating || 0,
          r.text || '',
          r.date || new Date().toISOString(),
          r.isGenerated || false,
        ],
      )
    }
    console.log(`✓ Reviews imported`)

    // 6. Emergency — flattened from nested structure
    const rawEmergency = readJson<Record<string, unknown[]>>('emergency.json')
    let emergencyCount = 0
    let idx = 0
    const emptyLoc = { lat: 0, lng: 0, address: { ru: '', en: '' } }

    for (const item of (rawEmergency.emergencyNumbers || []) as Array<Record<string, unknown>>) {
      idx++
      await client.query(
        `INSERT INTO emergency_contacts (id, type, name, phone, location, is_24h)
         VALUES ($1, 'police', $2, $3, $4, true)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone`,
        [`emergency-${idx}`, JSON.stringify(item.service || { ru: '', en: '' }), String(item.number || ''), JSON.stringify(emptyLoc)],
      )
      emergencyCount++
    }
    for (const item of (rawEmergency.hospitals || []) as Array<Record<string, unknown>>) {
      idx++
      const loc = item.location as { lat?: number; lng?: number } | undefined
      await client.query(
        `INSERT INTO emergency_contacts (id, type, name, phone, location, is_24h)
         VALUES ($1, 'hospital', $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, location = EXCLUDED.location`,
        [
          `emergency-${idx}`,
          JSON.stringify(item.name || { ru: '', en: '' }),
          String(item.phone || ''),
          JSON.stringify({
            lat: loc?.lat || 0,
            lng: loc?.lng || 0,
            address: item.address || { ru: '', en: '' },
          }),
          !!item.hasEmergency,
        ],
      )
      emergencyCount++
    }
    for (const item of (rawEmergency.traumaCenters || []) as Array<Record<string, unknown>>) {
      idx++
      const loc = item.location as { lat?: number; lng?: number } | undefined
      await client.query(
        `INSERT INTO emergency_contacts (id, type, name, phone, location, is_24h)
         VALUES ($1, 'trauma', $2, $3, $4, false)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [
          `emergency-${idx}`,
          JSON.stringify(item.name || { ru: '', en: '' }),
          String(item.phone || ''),
          JSON.stringify({
            lat: loc?.lat || 0,
            lng: loc?.lng || 0,
            address: item.address || { ru: '', en: '' },
          }),
        ],
      )
      emergencyCount++
    }
    for (const item of (rawEmergency.pharmacies || []) as Array<Record<string, unknown>>) {
      idx++
      const loc = item.location as { lat?: number; lng?: number } | undefined
      await client.query(
        `INSERT INTO emergency_contacts (id, type, name, phone, location, is_24h)
         VALUES ($1, 'pharmacy', $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [
          `emergency-${idx}`,
          JSON.stringify(item.name || { ru: '', en: '' }),
          String(item.phone || ''),
          JSON.stringify({
            lat: loc?.lat || 0,
            lng: loc?.lng || 0,
            address: item.address || { ru: '', en: '' },
          }),
          !!item.is24h,
        ],
      )
      emergencyCount++
    }
    console.log(`✓ ${emergencyCount} emergency contacts imported`)

    // 7. Transport
    const rawTransport = readJson<Record<string, unknown[]>>('transport.json')
    const routes = (rawTransport.routes || []) as Array<Record<string, unknown>>
    console.log(`Importing ${routes.length} transport routes...`)
    for (const r of routes) {
      const rawStops = (r.stops || []) as Array<Record<string, unknown>>
      const stops = rawStops.map((s) => ({
        name: s.name || { ru: '', en: '' },
        location: { lat: (s.lat as number) || 0, lng: (s.lng as number) || 0 },
      }))
      await client.query(
        `INSERT INTO transport_routes (id, number, name, type, stops, schedule, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           number = EXCLUDED.number,
           name = EXCLUDED.name,
           type = EXCLUDED.type,
           stops = EXCLUDED.stops,
           schedule = EXCLUDED.schedule,
           color = EXCLUDED.color,
           updated_at = now()`,
        [
          String(r.id || `transport-${routes.indexOf(r) + 1}`),
          String(r.number || ''),
          JSON.stringify(r.name || { ru: '', en: '' }),
          String(r.type || 'bus'),
          JSON.stringify(stops),
          r.hours ? JSON.stringify({ weekday: r.hours, weekend: r.hours }) : null,
          '#3B82F6',
        ],
      )
    }
    console.log(`✓ Transport routes imported`)

    await client.query('COMMIT')
    console.log('\n✅ All data imported successfully')

    // Summary
    const tables = ['pois', 'menu_items', 'guides', 'tours', 'reviews', 'emergency_contacts', 'transport_routes']
    for (const t of tables) {
      const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM ${t}`)
      console.log(`  ${t}: ${rows[0].n}`)
    }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Import failed:', err)
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
