import { openDB } from 'idb'
import { defaultTakeoutCategories, seedData } from './seed'
import type { AppData } from '../types'

const DB_NAME = 'jinwan-chi-shenme'
const STORE_NAME = 'app-data'
const DATA_KEY = 'current'

async function database() {
  return openDB(DB_NAME, 1, { upgrade(db) { if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME) } })
}

export function normalizeData(value: AppData): AppData {
  const storedCategories = value.settings?.takeoutCategories
  const takeoutCategories = Array.isArray(storedCategories)
    ? [...new Set(storedCategories.map((item) => item.trim()).filter(Boolean))]
    : [...new Set([...defaultTakeoutCategories, ...value.takeouts.map((item) => item.category).filter(Boolean)])]
  return {
    ...value,
    settings: {
      groceryUrl: value.settings?.groceryUrl ?? '',
      takeoutCategories
    }
  }
}

export async function loadData(): Promise<AppData> {
  const db = await database()
  const existing = await db.get(STORE_NAME, DATA_KEY) as AppData | undefined
  if (existing) return normalizeData(existing)
  await db.put(STORE_NAME, structuredClone(seedData), DATA_KEY)
  return structuredClone(seedData)
}

export async function saveData(data: AppData) {
  const db = await database()
  await db.put(STORE_NAME, data, DATA_KEY)
}

export async function requestPersistentStorage() {
  if (navigator.storage?.persist) return navigator.storage.persist()
  return false
}
