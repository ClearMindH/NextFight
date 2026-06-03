/**
 * Sync Hexagone MMA roster from https://hexagonemma.fr/combattants/
 * - Listing HTML (athlètes actifs + anciens)
 * - Enrichment via WordPress REST API (combattant CPT, FR)
 *
 * Usage: npm run sync:hexagone-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { slugifyId } from '../lib/mappers/ufc-api'
import {
  HEXAGONE_ROSTER_URL,
  HEXAGONE_WP_API,
  isFrenchCombattantLink,
  mapHexagoneToFighter,
  mapWpCombattantToPartial,
  parseHexagoneListingHtml,
  type HexListingFighter,
  type HexWpCombattant,
} from '../lib/mappers/hexagone-com'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const HEX_PATH = join(process.cwd(), 'data', 'rosters', 'hexagone.json')
const FETCH_TIMEOUT_MS = 45_000

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0 (Hexagone roster)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function fetchWpPage(page: number): Promise<{
  items: HexWpCombattant[]
  total: number
  totalPages: number
}> {
  const url = `${HEXAGONE_WP_API}?per_page=100&page=${page}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} WP API page ${page}`)
  const items = (await res.json()) as HexWpCombattant[]
  return {
    items,
    total: Number(res.headers.get('x-wp-total') ?? 0),
    totalPages: Number(res.headers.get('x-wp-totalpages') ?? 1),
  }
}

async function fetchFrenchWpIndex(): Promise<{
  bySlug: Map<string, ReturnType<typeof mapWpCombattantToPartial>>
  byName: Map<string, ReturnType<typeof mapWpCombattantToPartial>>
}> {
  const bySlug = new Map<string, ReturnType<typeof mapWpCombattantToPartial>>()
  const byName = new Map<string, ReturnType<typeof mapWpCombattantToPartial>>()

  console.log('Loading combattants index (WordPress API)…')

  let page = 1
  while (page <= 20) {
    const { items, total, totalPages } = await fetchWpPage(page)
    let added = 0

    for (const node of items) {
      if (!isFrenchCombattantLink(node.link)) continue
      const partial = mapWpCombattantToPartial(node)
      bySlug.set(node.slug, partial)
      byName.set(slugifyId(partial.name ?? node.title.rendered), partial)
      added++
    }

    console.log(`  WP page ${page}/${totalPages}: +${added} FR (index ${bySlug.size}/${total})`)
    if (page >= totalPages || items.length === 0) break
    page += 1
    await new Promise((r) => setTimeout(r, 250))
  }

  return { bySlug, byName }
}

function resolveWpData(
  row: HexListingFighter,
  bySlug: Map<string, ReturnType<typeof mapWpCombattantToPartial>>,
  byName: Map<string, ReturnType<typeof mapWpCombattantToPartial>>,
): ReturnType<typeof mapWpCombattantToPartial> | undefined {
  if (row.slug) {
    const hit = bySlug.get(row.slug)
    if (hit) return hit
  }
  return byName.get(slugifyId(row.name))
}

function loadExisting(): OrganizationRoster | null {
  if (!existsSync(HEX_PATH)) return null
  return JSON.parse(readFileSync(HEX_PATH, 'utf-8')) as OrganizationRoster
}

function mergeExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming
  const prev = new Map(existing.fighters.map((f) => [f.id, f]))
  return incoming.map((f) => {
    const old = prev.get(f.id)
    if (!old) return f
    return {
      ...f,
      nickname: old.nickname,
      imageUrl: f.imageUrl || old.imageUrl,
      ranking: old.ranking,
      stats: { ...old.stats, ...f.stats },
      source: 'merged',
    }
  })
}

async function main() {
  const html = await fetchText(HEXAGONE_ROSTER_URL)
  const listing = parseHexagoneListingHtml(html)

  if (listing.length === 0) {
    throw new Error('No fighters parsed from hexagonemma.fr/combattants/')
  }

  const active = listing.filter((f) => f.rosterGroup === 'active').length
  const alumni = listing.filter((f) => f.rosterGroup === 'alumni').length
  console.log(`Parsed listing: ${listing.length} (${active} actifs, ${alumni} anciens)`)

  const { bySlug, byName } = await fetchFrenchWpIndex()

  const fighters = listing
    .map((row) => mapHexagoneToFighter(row, resolveWpData(row, bySlug, byName)))
    .sort((a, b) => a.name.localeCompare(b.name))

  const merged = mergeExisting(fighters, loadExisting())

  saveRoster('hexagone', {
    meta: {
      organizationId: 'hexagone',
      fighterCount: merged.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'hexagonemma.fr',
    },
    fighters: merged,
  })

  console.log(`\nDone. ${merged.length} Hexagone fighters → ${HEX_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
