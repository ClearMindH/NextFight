import { syncPastEventResults } from '@/lib/events-store'

/**
 * Renseigne les résultats réels des événements passés à partir des combats
 * récents (scrapés) des combattants. Lancer APRÈS un resync du roster :
 *   npm run sync:all && npm run sync:results
 */
function main(): void {
  const { eventsUpdated, resultsResolved } = syncPastEventResults()
  console.log(
    `Événements mis à jour : ${eventsUpdated} · résultats résolus : ${resultsResolved}`,
  )
}

main()
