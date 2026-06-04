/**
 * Synchronise les classements (top 15 / champion) des combattants des cartes à venir.
 * - UFC : classements affichés sur UFC.com (carte officielle)
 * - ARES / autres : roster + seeds NextFight
 *
 * Usage: npm run sync:card-rankings
 */
import { auditCardRankings, loadWeekendEventsFromStore, syncCardRankingsForEvents } from '../lib/event-sync/sync-card-rankings'

async function main(): Promise<void> {
  const events = loadWeekendEventsFromStore()
  if (events.length === 0) {
    console.log('Aucun événement dans data/store/events.json')
    return
  }

  console.log(`NextFight — sync classements carte (${events.length} événement(s))\n`)

  const { ufcUpdated, aresUpdated, otherUpdated } = await syncCardRankingsForEvents(events)
  console.log(`  UFC roster mis à jour: ${ufcUpdated}`)
  console.log(`  ARES roster mis à jour: ${aresUpdated}`)
  if (otherUpdated) console.log(`  Autres orgs: ${otherUpdated}`)

  const audit = auditCardRankings(events)
  const withBadge = audit.filter((r) => r.badge)
  const withoutBadge = audit.filter((r) => !r.badge)

  console.log(`\n── Audit portraits (badge #N / C) ──`)
  console.log(`  Avec classement affichable: ${withBadge.length}`)
  console.log(`  Sans classement (NR ou hors top 15): ${withoutBadge.length}`)

  if (withBadge.length > 0) {
    console.log('\n  Badges OK:')
    for (const r of withBadge) {
      console.log(`    [${r.orgId}] ${r.badge} ${r.name}`)
    }
  }

  if (withoutBadge.length > 0) {
    console.log('\n  Pas de badge (normal si non classé UFC/ARES):')
    for (const r of withoutBadge) {
      console.log(`    [${r.orgId}] ${r.name}`)
    }
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
