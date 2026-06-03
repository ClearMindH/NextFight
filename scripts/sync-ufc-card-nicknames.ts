/**
 * Récupère les surnoms UFC.com pour les combattants des cartes à venir.
 * Usage: npm run sync:ufc-nicknames
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fetchUfcAthleteNickname } from '../lib/mappers/ufc-athlete-enrichment'
import { getFighterFromStore, upsertFighterInStore } from '../lib/roster-store'
import type { EventInput } from '../types/admin'

const EVENTS_PATH = join(process.cwd(), 'data', 'store', 'events.json')
const DELAY_MS = 400

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function ufcCardFighterIds(): string[] {
  if (!existsSync(EVENTS_PATH)) return []
  const store = JSON.parse(readFileSync(EVENTS_PATH, 'utf-8')) as { events: EventInput[] }
  const ids = new Set<string>()
  for (const event of store.events) {
    if (event.organizationId !== 'ufc') continue
    for (const fight of event.fights) {
      ids.add(fight.redId)
      ids.add(fight.blueId)
    }
  }
  return [...ids]
}

async function main(): Promise<void> {
  const ids = ufcCardFighterIds()
  console.log(`UFC card nicknames — ${ids.length} fighter(s)\n`)

  let updated = 0
  for (const id of ids) {
    const fighter = getFighterFromStore(id)
    if (!fighter) continue
    const slug = id.replace(/^ufc-/, '')
    await sleep(DELAY_MS)
    const nick = await fetchUfcAthleteNickname(slug)
    if (!nick) {
      console.log(`  — ${fighter.name}: aucun surnom sur UFC.com`)
      continue
    }
    if (fighter.nickname === nick) {
      console.log(`  ✓ ${fighter.name}: "${nick}" (déjà en base)`)
      continue
    }
    upsertFighterInStore({
      ...fighter,
      nickname: nick,
      lastSyncedAt: new Date().toISOString(),
    })
    updated += 1
    console.log(`  ✓ ${fighter.name}: "${nick}"`)
  }

  console.log(`\nDone. ${updated} nickname(s) updated.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
