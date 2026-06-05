/**
 * Enrichit le roster avec les profils méthodes Sherdog / Tapology.
 * Usage: npx tsx scripts/sync-external-records.ts [--org ufc] [--limit 20]
 */
import { loadEventsHydrated } from '@/lib/events-store'
import { getFighterFromStore, upsertFighterInStore } from '@/lib/roster-store'
import { enrichFighterExternalMethods } from '@/lib/fighter-external-enrichment'

async function main() {
  const limit = Number(
    process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 30,
  )
  const events = loadEventsHydrated()
  const ids = new Set<string>()
  for (const ev of events) {
    for (const f of ev.fights) {
      ids.add(f.redCorner.id)
      ids.add(f.blueCorner.id)
    }
  }

  const queue = [...ids].slice(0, limit)
  console.log(
    `Sync Sherdog/Tapology — ${queue.length} combattants (${events.length} événements)…`,
  )
  console.log('(Tapology peut être bloqué côté serveur ; Sherdog reste la source principale.)\n')

  let done = 0
  let skipped = 0
  let failed = 0
  for (const [i, id] of queue.entries()) {
    const raw = getFighterFromStore(id)
    if (!raw) {
      console.log(`[${i + 1}/${queue.length}] ${id} — absent du roster`)
      failed += 1
      continue
    }

    process.stdout.write(`[${i + 1}/${queue.length}] ${raw.name}… `)
    const enriched = await enrichFighterExternalMethods(raw)
    if (enriched.externalMethodCounts) {
      upsertFighterInStore({
        ...enriched,
        lastSyncedAt: new Date().toISOString(),
      })
      const m = enriched.externalMethodCounts
      console.log(
        `OK ${m.wins}-${m.losses} (KO ${m.koWins} / Sub ${m.subWins} / Dec ${m.decWins}) [${m.source}]`,
      )
      done += 1
    } else if (enriched === raw || !enriched.externalMethodCounts) {
      console.log('skip (roster déjà complet ou source introuvable)')
      skipped += 1
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  console.log(`\nTerminé : ${done} enrichis, ${skipped} ignorés, ${failed} introuvables.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
