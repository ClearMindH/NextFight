import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const CACHE_PATH = path.join(process.cwd(), 'data', 'cache', 'opponent-records.json')

export interface OpponentRecordEntry {
  /** Tier calculé (0–100), ou null si l'adversaire reste introuvable. */
  tier: number | null
  wins?: number
  losses?: number
  source?: string
  fetchedAt: string
}

export type OpponentRecordCache = Record<string, OpponentRecordEntry>

export function normalizeKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function loadOpponentRecordCache(): OpponentRecordCache {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as OpponentRecordCache
  } catch {
    return {}
  }
}

export function saveOpponentRecordCache(cache: OpponentRecordCache): void {
  const dir = path.dirname(CACHE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const sorted = Object.fromEntries(
    Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)),
  )
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8')
}
