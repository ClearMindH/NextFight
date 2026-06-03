/**
 * Sync fighter rosters:
 * - UFC: run `npm run sync:ufc-roster` first (ufc.com active roster), then optional API merge
 * - PFL: run `npm run sync:pfl-roster` first (pflmma.com WT roster)
 * - KSW: run `npm run sync:ksw-roster` first (kswmma.com/zawodnicy)
 * - Hexagone: run `npm run sync:hexagone-roster` first (hexagonemma.fr/combattants)
 * - ARES: run `npm run sync:ares-roster` first (aresfighting.com/fr/athletes)
 *
 * Usage: npm run sync:fighters
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { buildAllRosters } from '../data/seeds/build-roster'
import { mapUfcApiFighter, slugifyId, type UfcApiFighter } from '../lib/mappers/ufc-api'
import type { Fighter, OrganizationId, OrganizationRoster } from '../types'

const UFC_API = 'https://ufcapi.aristotle.me'
const OUT_DIR = join(process.cwd(), 'data', 'rosters')

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn(`  Failed: ${url}`, err instanceof Error ? err.message : err)
    return null
  }
}

interface PaginatedFighters {
  data?: UfcApiFighter[]
  fighters?: UfcApiFighter[]
  items?: UfcApiFighter[]
  pagination?: { page: number; totalPages: number; hasMore?: boolean }
  meta?: { page: number; totalPages: number }
}

function extractFighters(payload: PaginatedFighters): UfcApiFighter[] {
  if (Array.isArray(payload)) return payload as unknown as UfcApiFighter[]
  return payload.data ?? payload.fighters ?? payload.items ?? []
}

async function fetchUfcRosterFromApi(): Promise<Fighter[]> {
  const collected: Fighter[] = []
  let page = 1
  const maxPages = 15
  const limit = 100

  console.log('Fetching UFC fighters from API…')

  while (page <= maxPages) {
    const url = `${UFC_API}/api/fighters?limit=${limit}&page=${page}`
    const payload = await fetchJson<PaginatedFighters>(url)
    if (!payload) break

    const batch = extractFighters(payload).map(mapUfcApiFighter)
    if (batch.length === 0) break

    collected.push(...batch)
    console.log(`  Page ${page}: +${batch.length} fighters (total ${collected.length})`)

    const totalPages = payload.pagination?.totalPages ?? payload.meta?.totalPages
    if (totalPages && page >= totalPages) break
    if (batch.length < limit) break
    page += 1
    await new Promise((r) => setTimeout(r, 400))
  }

  return collected
}

function mergeUfcRosters(seed: OrganizationRoster, api: Fighter[]): OrganizationRoster {
  if (api.length === 0) {
    console.log('  UFC API unavailable — using seed roster only.')
    return seed
  }

  const bySlug = new Map<string, Fighter>()
  for (const f of seed.fighters) bySlug.set(slugifyId(f.name), f)

  for (const f of api) {
    const key = slugifyId(f.name)
    const existing = bySlug.get(key)
    bySlug.set(key, existing ? { ...existing, ...f, source: 'merged' } : f)
  }

  const fighters = Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name))
  return {
    meta: {
      organizationId: 'ufc',
      fighterCount: fighters.length,
      lastSyncedAt: new Date().toISOString(),
      source: api.length > 0 ? 'ufc-api+seed' : 'roster-seed',
    },
    fighters,
  }
}

function writeRoster(org: OrganizationId, roster: OrganizationRoster) {
  const path = join(OUT_DIR, `${org}.json`)
  writeFileSync(path, JSON.stringify(roster, null, 2), 'utf-8')
  console.log(`  Wrote ${path} (${roster.fighters.length} fighters)`)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const rosters = buildAllRosters()

  const ufcApi = await fetchUfcRosterFromApi()
  rosters.ufc = mergeUfcRosters(rosters.ufc, ufcApi)

  for (const org of Object.keys(rosters) as OrganizationId[]) {
    writeRoster(org, rosters[org])
  }

  const total = Object.values(rosters).reduce((n, r) => n + r.fighters.length, 0)
  console.log(`\nDone. ${total} fighters across 5 organizations.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
