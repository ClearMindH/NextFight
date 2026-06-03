/**
 * Sync ARES roster from https://www.aresfighting.com/fr/athletes/?gender=all
 * Loads fighters per weight class via admin-ajax (load_fighters).
 *
 * Usage: npm run sync:ares-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  ARES_AJAX_URL,
  ARES_ROSTER_URL,
  mapAresHtmlToFighter,
  parseAresCategoriesHtml,
  parseAresFighterRowsHtml,
  type AresCategory,
  type AresHtmlFighter,
} from '../lib/mappers/ares-com'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const ARES_PATH = join(process.cwd(), 'data', 'rosters', 'ares.json')
const FETCH_TIMEOUT_MS = 60_000
const MAX_PAGES_PER_CATEGORY = 80

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0 (ARES roster)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function loadFightersPage(
  category: AresCategory,
  page: number,
): Promise<string> {
  const body = new URLSearchParams({
    action: 'load_fighters',
    keyword: '',
    category: String(category.categoryId),
    gender: category.gender,
    page: String(page),
  })

  const res = await fetch(ARES_AJAX_URL, {
    method: 'POST',
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} load_fighters cat=${category.categoryId}`)
  return res.text()
}

async function fetchCategoryFighters(category: AresCategory): Promise<AresHtmlFighter[]> {
  const collected: AresHtmlFighter[] = []

  for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
    const html = await loadFightersPage(category, page)
    const batch = parseAresFighterRowsHtml(html, category.weightClass, category.gender)
    collected.push(...batch)

    if (html.includes('</end>')) break
    if (batch.length === 0) break
    await new Promise((r) => setTimeout(r, 250))
  }

  return collected
}

function loadExisting(): OrganizationRoster | null {
  if (!existsSync(ARES_PATH)) return null
  return JSON.parse(readFileSync(ARES_PATH, 'utf-8')) as OrganizationRoster
}

function mergeExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming
  const prev = new Map(existing.fighters.map((f) => [f.id, f]))
  return incoming.map((f) => {
    const old = prev.get(f.id)
    if (!old) return f
    return {
      ...f,
      nickname: f.nickname || old.nickname,
      imageUrl: f.imageUrl || old.imageUrl,
      ranking: f.ranking ?? old.ranking,
      stats: { ...old.stats, ...f.stats },
      source: 'merged',
    }
  })
}

async function main() {
  const html = await fetchText(ARES_ROSTER_URL)
  const categories = parseAresCategoriesHtml(html)

  if (categories.length === 0) {
    throw new Error('No weight categories found on aresfighting.com/fr/athletes')
  }

  console.log(`Found ${categories.length} categories (gender=all page)`)

  const byFighterId = new Map<string, AresHtmlFighter>()

  for (const category of categories) {
    const batch = await fetchCategoryFighters(category)
    let added = 0

    for (const row of batch) {
      const prev = byFighterId.get(row.fighterId)
      if (!prev) {
        byFighterId.set(row.fighterId, row)
        added++
      }
    }

    console.log(
      `  ${category.weightClass} (${category.gender}, cat ${category.categoryId}): ${batch.length} rows, +${added} new (total ${byFighterId.size})`,
    )
  }

  if (byFighterId.size === 0) {
    throw new Error('No fighters loaded from ARES')
  }

  const fighters = [...byFighterId.values()]
    .map((row) => mapAresHtmlToFighter(row))
    .sort((a, b) => a.name.localeCompare(b.name))

  const merged = mergeExisting(fighters, loadExisting())

  saveRoster('ares', {
    meta: {
      organizationId: 'ares',
      fighterCount: merged.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'aresfighting.com',
    },
    fighters: merged,
  })

  console.log(`\nDone. ${merged.length} ARES fighters → ${ARES_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
