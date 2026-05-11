import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { POI, Tour, Review, EmergencyContact, TransportRoute, Collection, UserPreferences } from './types'

interface BrobrogidDB extends DBSchema {
  pois: { key: string; value: POI; indexes: { 'by-category': string; 'by-slug': string } }
  tours: { key: string; value: Tour; indexes: { 'by-status': string } }
  reviews: { key: string; value: Review; indexes: { 'by-target': [string, string] } }
  emergency: { key: string; value: EmergencyContact; indexes: { 'by-type': string } }
  transport: { key: string; value: TransportRoute }
  collections: { key: string; value: Collection }
  userPrefs: { key: string; value: UserPreferences }
}

let dbInstance: IDBPDatabase<BrobrogidDB> | null = null

export async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<BrobrogidDB>('brobrogid', 31, {
    upgrade(db, oldVersion) {
      // Wipe all stores on version bump to re-seed with fresh data
      if (oldVersion < 31) {
        for (const name of db.objectStoreNames) {
          db.deleteObjectStore(name)
        }
      }
      const poiStore = db.createObjectStore('pois', { keyPath: 'id' })
      poiStore.createIndex('by-category', 'category')
      poiStore.createIndex('by-slug', 'slug')

      const tourStore = db.createObjectStore('tours', { keyPath: 'id' })
      tourStore.createIndex('by-status', 'status')

      const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' })
      reviewStore.createIndex('by-target', ['targetType', 'targetId'])

      const emergencyStore = db.createObjectStore('emergency', { keyPath: 'id' })
      emergencyStore.createIndex('by-type', 'type')

      db.createObjectStore('transport', { keyPath: 'id' })
      db.createObjectStore('collections', { keyPath: 'id' })
      db.createObjectStore('userPrefs', { keyPath: 'language' })
    },
  })

  return dbInstance
}
