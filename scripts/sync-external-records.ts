/**
 * Enrichit le roster avec les profils méthodes Sherdog / Tapology.
 * Usage: npx tsx scripts/sync-external-records.ts [--org ufc] [--limit 20]
 */
import { loadEventsHydrated } from '@/lib/events-store'
import { getFighterFromStore, upsertFighterInStore } from '@/lib/roster-store'
import { enrichFighterExternalMethods } from '@/lib/fighter-external-enrichment'

async function main() {
  const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 30)
  const events = loadEventsHydrated()
  const ids = new Set<string>()
  for (const ev of events) {
    for (const f of ev.fights) {
      ids.add(f.redCorner.id)
      ids.add(f.blueCorner.id)
    }
  }

  let done = 0
  for (const id of [...ids].slice(0, limit)) {
    const raw = getFighterFromStore(id)
    if (!raw) continue
    const enriched = await enrichFighterExternalMethods(raw)
    if (enriched.externalMethodCounts) {
      upsertFighterInStore({
        ...enriched,
        lastSyncedAt: new Date().toISOString(),
      })
      console.log(
        `  ${enriched.name}: ${enriched.externalMethodCounts.wins}-${enriched.externalMethodCounts.losses} (${enriched.externalMethodCounts.source})`,
      )
      done += 1
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  console.log(`Enriched ${done} fighters.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
