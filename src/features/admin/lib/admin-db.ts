import { getDB } from '@/data/db'

type StoreName =
  | 'pois'
  | 'menuItems'
  | 'tours'
  | 'guides'
  | 'reviews'
  | 'emergency'
  | 'transport'
  | 'collections'
  | 'orders'

export async function adminGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).getAll(storeName) as Promise<T[]>
}

export async function adminGetById<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).get(storeName, id) as Promise<T | undefined>
}

export async function adminPut<T>(storeName: StoreName, item: T): Promise<void> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).put(storeName, item)
}

export async function adminRemove(storeName: StoreName, id: string): Promise<void> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).delete(storeName, id)
}

export async function adminCount(storeName: StoreName): Promise<number> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).count(storeName) as Promise<number>
}

export async function adminGetByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey,
): Promise<T[]> {
  const db = await getDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).getAllFromIndex(storeName, indexName, value) as Promise<T[]>
}
