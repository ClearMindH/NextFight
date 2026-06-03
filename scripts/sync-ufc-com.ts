/**
 * Sync UFC active roster from https://www.ufc.com/athletes/all
 * - HTML listing (status: Actif / id 23) for names, records, weight class, photos
 * - JSON:API for stats when athlete_stat is linked
 *
 * Usage: npm run sync:ufc-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { slugifyId } from '../lib/mappers/ufc-api'
import {
  activeAthletesApiUrl,
  athletesAllActiveHtmlUrl,
  mapUfcJsonAthlete,
  parseUfcAthletesHtml,
  type UfcJsonApiAthlete,
} from '../lib/mappers/ufc-com'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const UFC_PATH = join(process.cwd(), 'data', 'rosters', 'ufc.json')
const FETCH_TIMEOUT_MS = 45_000

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0 (UFC active roster)',
      Accept: 'text/html,application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      Accept: 'application/vnd.api+json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json() as Promise<T>
}

async function fetchHtmlRoster(): Promise<Map<string, ReturnType<typeof parseUfcAthletesHtml>[0]>> {
  const bySlug = new Map<string, ReturnType<typeof parseUfcAthletesHtml>[0]>()
  const maxPages = 100

  console.log('Fetching active athletes from ufc.com/athletes/all (HTML)…')

  for (let page = 0; page < maxPages; page++) {
    const url = athletesAllActiveHtmlUrl(page)
    const html = await fetchText(url)
    const batch = parseUfcAthletesHtml(html)
    if (batch.length === 0) break

    let added = 0
    for (const row of batch) {
      if (!bySlug.has(row.slug)) {
        bySlug.set(row.slug, row)
        added++
      }
    }

    console.log(`  Page ${page}: +${added} new (${bySlug.size} total)`)
    if (added === 0) break
    await new Promise((r) => setTimeout(r, 350))
  }

  return bySlug
}

async function fetchJsonAthletes(): Promise<UfcJsonApiAthlete[]> {
  const collected: UfcJsonApiAthlete[] = []
  let offset = 0
  const limit = 50

  console.log('Fetching active athletes (JSON:API, status=Actif)…')

  while (offset < 1200) {
    const payload = await fetchJson<{
      data: UfcJsonApiAthlete[]
      links?: { next?: { href: string } }
    }>(activeAthletesApiUrl(offset, limit))

    const batch = payload.data ?? []
    if (batch.length === 0) break

    collected.push(...batch)
    console.log(`  Offset ${offset}: +${batch.length} (total ${collected.length})`)

    if (batch.length < limit) break
    offset += limit
    await new Promise((r) => setTimeout(r, 400))
  }

  return collected
}

function loadExisting(): OrganizationRoster | null {
  if (!existsSync(UFC_PATH)) return null
  return JSON.parse(readFileSync(UFC_PATH, 'utf-8')) as OrganizationRoster
}

function mergeExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming
  const prev = new Map(existing.fighters.map((f) => [slugifyId(f.name), f]))
  return incoming.map((f) => {
    const old = prev.get(slugifyId(f.name))
    if (!old) return f
    return {
      ...f,
      nickname: f.nickname || old.nickname,
      imageUrl: f.imageUrl || old.imageUrl,
      ranking: f.ranking ?? old.ranking,
      recentBouts: f.recentBouts?.length ? f.recentBouts : old.recentBouts,
      stats: { ...f.stats, ...old.stats, age: f.stats.age, winStreak: f.stats.winStreak },
      source: 'merged',
    }
  })
}

async function main() {
  const htmlBySlug = await fetchHtmlRoster()
  const jsonNodes = await fetchJsonAthletes()

  const jsonBySlug = new Map<string, UfcJsonApiAthlete>()
  for (const node of jsonNodes) {
    const slug =
      node.attributes.path?.alias?.replace(/^\/athlete\//, '') ||
      slugifyId(node.attributes.title)
    jsonBySlug.set(slug, node)
  }

  /** Roster = exactement la liste ufc.com/athletes/all (filtre Actif), enrichie par JSON:API */
  const fighters: Fighter[] = []

  for (const [slug, html] of htmlBySlug) {
    const node = jsonBySlug.get(slug)
    if (!node) {
      fighters.push(
        mapUfcJsonAthlete(
          {
            type: 'node--athlete',
            id: slug,
            attributes: {
              title: html.name,
              path: { alias: `/athlete/${slug}` },
            },
          },
          undefined,
          html,
        ),
      )
      continue
    }

    fighters.push(mapUfcJsonAthlete(node, undefined, html))
  }

  fighters.sort((a, b) => a.name.localeCompare(b.name))

  const existing = loadExisting()
  const merged = mergeExisting(fighters, existing)

  const roster: OrganizationRoster = {
    meta: {
      organizationId: 'ufc',
      fighterCount: merged.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'ufc.com',
    },
    fighters: merged,
  }

  saveRoster('ufc', roster)
  console.log(`\nDone. ${merged.length} active UFC fighters → ${UFC_PATH}`)
  console.log(`  Listed on ufc.com (Actif): ${htmlBySlug.size} | JSON enrich: ${jsonNodes.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
