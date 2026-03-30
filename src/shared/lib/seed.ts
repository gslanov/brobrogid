import { getDB } from '@/data/db'

async function loadJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  return res.json()
}

export async function seedDatabase() {
  const db = await getDB()

  const poisCount = await db.count('pois')
  if (poisCount > 0) return // Already seeded

  const [pois, tours, guides, reviews, emergency, transport, menuItems] = await Promise.all([
    loadJSON('/content/pois.json'),
    loadJSON('/content/tours.json'),
    loadJSON('/content/guides.json'),
    loadJSON('/content/reviews.json'),
    loadJSON('/content/emergency.json'),
    loadJSON('/content/transport.json'),
    loadJSON('/content/menu-items.json'),
  ])

  const tx = db.transaction(
    ['pois', 'tours', 'guides', 'reviews', 'emergency', 'transport', 'menuItems', 'collections'],
    'readwrite',
  )

  for (const poi of pois as any[]) await tx.objectStore('pois').put(poi)
  for (const tour of tours as any[]) await tx.objectStore('tours').put(tour)
  for (const guide of guides as any[]) await tx.objectStore('guides').put(guide)
  for (const review of reviews as any[]) await tx.objectStore('reviews').put(review)
  for (const item of emergency as any[]) await tx.objectStore('emergency').put(item)
  for (const route of transport as any[]) await tx.objectStore('transport').put(route)
  for (const item of menuItems as any[]) await tx.objectStore('menuItems').put(item)

  // Create default favorites collection
  await tx.objectStore('collections').put({
    id: 'favorites',
    name: 'Избранное',
    poiIds: [],
    createdAt: new Date().toISOString(),
  })

  await tx.done
  console.log('Database seeded successfully')
}
