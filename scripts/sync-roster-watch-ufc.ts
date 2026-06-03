/**
 * Sync UFC active roster from https://www.roster.watch (HTML table).
 * Preserves existing stats/nicknames when fighter names match.
 *
 * Usage: npm run sync:ufc-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { slugifyId } from '../lib/mappers/ufc-api'
import {
  fetchRosterWatchHtml,
  parseRosterWatchHtml,
  rosterWatchRowsToFighters,
} from '../lib/mappers/roster-watch'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const UFC_PATH = join(process.cwd(), 'data', 'rosters', 'ufc.json')

function loadExistingUfc(): OrganizationRoster | null {
  if (!existsSync(UFC_PATH)) return null
  return JSON.parse(readFileSync(UFC_PATH, 'utf-8')) as OrganizationRoster
}

function mergeWithExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming

  const bySlug = new Map(existing.fighters.map((f) => [slugifyId(f.name), f]))

  return incoming.map((f) => {
    const prev = bySlug.get(slugifyId(f.name))
    if (!prev) return f
    return {
      ...f,
      nickname: prev.nickname ?? f.nickname,
      imageUrl: prev.imageUrl,
      stance: prev.stance,
      stats: { ...f.stats, ...prev.stats, age: f.stats.age, winStreak: f.stats.winStreak },
      source: 'merged',
    }
  })
}

async function main() {
  console.log('Fetching UFC roster from roster.watch…')
  const html = await fetchRosterWatchHtml()
  const rows = parseRosterWatchHtml(html)
  console.log(`  Parsed ${rows.length} rows (${new Set(rows.map((r) => r.name)).size} unique names)`)

  let fighters = rosterWatchRowsToFighters(rows)
  const existing = loadExistingUfc()
  fighters = mergeWithExisting(fighters, existing)

  const roster: OrganizationRoster = {
    meta: {
      organizationId: 'ufc',
      fighterCount: fighters.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'roster.watch',
    },
    fighters,
  }

  saveRoster('ufc', roster)
  console.log(`\nDone. Wrote ${UFC_PATH} with ${fighters.length} UFC fighters.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
