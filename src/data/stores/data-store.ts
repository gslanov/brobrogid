import { create } from 'zustand'
import type { POI, Tour, Guide, Collection, UserPreferences } from '../types'
import { getDB } from '../db'

interface DataState {
  pois: POI[]
  tours: Tour[]
  guides: Guide[]
  collections: Collection[]
  userPrefs: UserPreferences
  isLoaded: boolean
  loadAll: () => Promise<void>
  toggleFavorite: (poiId: string) => Promise<void>
  addToCollection: (collectionId: string, poiId: string) => Promise<void>
  createCollection: (name: string) => Promise<Collection>
}

const DEFAULT_PREFS: UserPreferences = {
  language: 'ru',
  visitedPois: [],
}

export const useDataStore = create<DataState>((set, get) => ({
  pois: [],
  tours: [],
  guides: [],
  collections: [],
  userPrefs: DEFAULT_PREFS,
  isLoaded: false,

  loadAll: async () => {
    const db = await getDB()
    const [pois, tours, guides, collections] = await Promise.all([
      db.getAll('pois'),
      db.getAll('tours'),
      db.getAll('guides'),
      db.getAll('collections'),
    ])

    const prefs = await db.get('userPrefs', 'ru')

    set({
      pois,
      tours,
      guides,
      collections,
      userPrefs: prefs || DEFAULT_PREFS,
      isLoaded: true,
    })
  },

  toggleFavorite: async (poiId: string) => {
    const db = await getDB()
    const { collections } = get()
    let defaultCollection = collections.find((c) => c.id === 'favorites')

    if (!defaultCollection) {
      defaultCollection = { id: 'favorites', name: 'Избранное', poiIds: [], createdAt: new Date().toISOString() }
      await db.put('collections', defaultCollection)
    }

    const exists = defaultCollection.poiIds.includes(poiId)
    const updated = {
      ...defaultCollection,
      poiIds: exists
        ? defaultCollection.poiIds.filter((id) => id !== poiId)
        : [...defaultCollection.poiIds, poiId],
    }

    await db.put('collections', updated)
    set({ collections: collections.map((c) => (c.id === 'favorites' ? updated : c)) })
  },

  addToCollection: async (collectionId: string, poiId: string) => {
    const db = await getDB()
    const { collections } = get()
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection || collection.poiIds.includes(poiId)) return

    const updated = { ...collection, poiIds: [...collection.poiIds, poiId] }
    await db.put('collections', updated)
    set({ collections: collections.map((c) => (c.id === collectionId ? updated : c)) })
  },

  createCollection: async (name: string) => {
    const db = await getDB()
    const collection: Collection = {
      id: crypto.randomUUID(),
      name,
      poiIds: [],
      createdAt: new Date().toISOString(),
    }
    await db.put('collections', collection)
    set((s) => ({ collections: [...s.collections, collection] }))
    return collection
  },
}))
