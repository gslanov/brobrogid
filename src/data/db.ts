import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { POI, MenuItem, Tour, Guide, Review, EmergencyContact, TransportRoute, Collection, Order, UserPreferences } from './types'

interface BrobrogidDB extends DBSchema {
  pois: { key: string; value: POI; indexes: { 'by-category': string; 'by-slug': string } }
  menuItems: { key: string; value: MenuItem; indexes: { 'by-poi': string } }
  tours: { key: string; value: Tour; indexes: { 'by-guide': string; 'by-status': string } }
  guides: { key: string; value: Guide }
  reviews: { key: string; value: Review; indexes: { 'by-target': [string, string] } }
  emergency: { key: string; value: EmergencyContact; indexes: { 'by-type': string } }
  transport: { key: string; value: TransportRoute }
  collections: { key: string; value: Collection }
  orders: { key: string; value: Order; indexes: { 'by-status': string } }
  userPrefs: { key: string; value: UserPreferences }
}

let dbInstance: IDBPDatabase<BrobrogidDB> | null = null

export async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<BrobrogidDB>('brobrogid', 1, {
    upgrade(db) {
      const poiStore = db.createObjectStore('pois', { keyPath: 'id' })
      poiStore.createIndex('by-category', 'category')
      poiStore.createIndex('by-slug', 'slug')

      const menuStore = db.createObjectStore('menuItems', { keyPath: 'id' })
      menuStore.createIndex('by-poi', 'poiId')

      const tourStore = db.createObjectStore('tours', { keyPath: 'id' })
      tourStore.createIndex('by-guide', 'guideId')
      tourStore.createIndex('by-status', 'status')

      db.createObjectStore('guides', { keyPath: 'id' })

      const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' })
      reviewStore.createIndex('by-target', ['targetType', 'targetId'])

      const emergencyStore = db.createObjectStore('emergency', { keyPath: 'id' })
      emergencyStore.createIndex('by-type', 'type')

      db.createObjectStore('transport', { keyPath: 'id' })
      db.createObjectStore('collections', { keyPath: 'id' })

      const orderStore = db.createObjectStore('orders', { keyPath: 'id' })
      orderStore.createIndex('by-status', 'status')

      db.createObjectStore('userPrefs', { keyPath: 'language' })
    },
  })

  return dbInstance
}
