/**
 * Sprint 6 — Dry-run для russification POI slugs
 *
 * Usage:
 *   DB_URL="postgres://postgres:PASS@127.0.0.1:15432/brobrogid" \
 *     npx tsx supabase/scripts/slug_migration_dry_run.ts > .agent/sprint6_dry_run.txt
 *
 * Читает pois, применяет транслитерацию к name.ru, генерит новые slug,
 * обнаруживает конфликты (дубликаты). Ничего не меняет в БД.
 */

import { Client } from 'pg'

interface POI {
  id: string
  slug: string
  category: string
  subcategory: string
  name: { ru: string; en?: string }
}

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Осетинский
  æ: 'ae',
}

function slugifyRu(text: string): string {
  let s = text.toLowerCase().trim()
  // Удалить кавычки и typographic символы
  s = s.replace(/[«»""'`„""‟''‹›]/g, '')
  // Удалить эмодзи и спецсимволы оставив только буквы/цифры/пробелы/дефисы
  s = s.replace(/[^\p{L}\p{N}\s\-]/gu, ' ')
  // Транслит
  let result = ''
  for (const ch of s) {
    result += CYRILLIC_MAP[ch] ?? ch
  }
  // Не-ASCII → дефис, множественные → один
  result = result.replace(/[^a-z0-9]+/g, '-')
  result = result.replace(/^-+|-+$/g, '')
  // Ограничение длины
  if (result.length > 80) {
    const cut = result.slice(0, 80)
    const lastDash = cut.lastIndexOf('-')
    result = lastDash > 40 ? cut.slice(0, lastDash) : cut
  }
  return result
}

function resolveConflict(baseSlug: string, poi: POI, taken: Set<string>): string {
  if (!taken.has(baseSlug)) return baseSlug
  // Попробовать добавить subcategory
  const subSlug = slugifyRu(poi.subcategory)
  if (subSlug) {
    const withSub = `${baseSlug}-${subSlug}`
    if (!taken.has(withSub)) return withSub
  }
  // Попробовать добавить category
  const catSlug = poi.category
  const withCat = `${baseSlug}-${catSlug}`
  if (!taken.has(withCat)) return withCat
  // Последний fallback — добавить id suffix
  const idSuffix = poi.id.replace('poi-', '')
  return `${baseSlug}-${idSuffix}`
}

async function main() {
  const dbUrl = process.env.DB_URL
  if (!dbUrl) {
    console.error('DB_URL environment variable is required')
    process.exit(1)
  }

  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  const { rows: pois } = await client.query<POI>(
    'SELECT id, slug, category, subcategory, name FROM pois ORDER BY id',
  )

  console.log('# Sprint 6 — Russian slugs dry run')
  console.log(`# Generated: ${new Date().toISOString()}`)
  console.log(`# Total POIs: ${pois.length}`)
  console.log('')

  // Pass 1: generate candidate slugs
  const candidates = pois.map((poi) => {
    const newSlug = slugifyRu(poi.name.ru)
    return { poi, oldSlug: poi.slug, newSlug }
  })

  // Pass 2: resolve conflicts
  const taken = new Set<string>()
  const final: Array<{ poi: POI; oldSlug: string; newSlug: string; isChanging: boolean; resolved: boolean }> = []

  for (const c of candidates) {
    const base = c.newSlug
    const resolved = resolveConflict(base, c.poi, taken)
    taken.add(resolved)
    final.push({
      poi: c.poi,
      oldSlug: c.oldSlug,
      newSlug: resolved,
      isChanging: resolved !== c.oldSlug,
      resolved: resolved !== base,
    })
  }

  // Stats
  const changing = final.filter((f) => f.isChanging)
  const conflicts = final.filter((f) => f.resolved)
  const unchanged = final.filter((f) => !f.isChanging)

  console.log(`# Summary`)
  console.log(`#   Unchanged (slug already Russian-ish): ${unchanged.length}`)
  console.log(`#   Will change: ${changing.length}`)
  console.log(`#   Conflicts resolved with suffix: ${conflicts.length}`)
  console.log('')

  // Check for empty new slugs
  const empty = final.filter((f) => !f.newSlug)
  if (empty.length > 0) {
    console.log('# ⚠️  EMPTY SLUGS (name.ru produced no ASCII output)')
    for (const e of empty) {
      console.log(`#   ${e.poi.id}: "${e.poi.name.ru}" → EMPTY`)
    }
    console.log('')
  }

  // Check for duplicates after resolution
  const slugCounts = new Map<string, number>()
  for (const f of final) {
    slugCounts.set(f.newSlug, (slugCounts.get(f.newSlug) ?? 0) + 1)
  }
  const dupes = [...slugCounts.entries()].filter(([, c]) => c > 1)
  if (dupes.length > 0) {
    console.log('# ❌ UNRESOLVED DUPLICATES — MIGRATION WILL FAIL UNIQUE CONSTRAINT')
    for (const [slug, count] of dupes) {
      console.log(`#   ${slug}: ${count}`)
    }
    console.log('')
  } else {
    console.log('# ✅ All new slugs are unique')
    console.log('')
  }

  // Generate SQL
  console.log('-- ============================================================')
  console.log('-- SQL UPDATE statements (for migration 0013_russian_slugs.sql)')
  console.log('-- ============================================================')
  console.log('')

  for (const f of changing) {
    const escapedSlug = f.newSlug.replace(/'/g, "''")
    const escapedOld = f.oldSlug.replace(/'/g, "''")
    const nameRu = f.poi.name.ru.replace(/\n/g, ' ').slice(0, 60)
    console.log(`-- ${f.poi.id}: "${nameRu}"`)
    console.log(`--   ${escapedOld}`)
    console.log(`--   → ${escapedSlug}${f.resolved ? ' [CONFLICT RESOLVED]' : ''}`)
    console.log(
      `UPDATE public.pois SET slug = '${escapedSlug}' WHERE id = '${f.poi.id}';`,
    )
    console.log('')
  }

  console.log('-- END OF UPDATES')
  console.log(`-- Total UPDATE statements: ${changing.length}`)

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
