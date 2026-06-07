import { loadEventsRaw, freezeEventPredictions } from '@/lib/events-store'

/** Fige les pronostics des événements imminents (ou passés) non encore figés. */
const DAYS_BEFORE = 3

function main(): void {
  const store = loadEventsRaw()
  const now = Date.now()
  let total = 0

  for (const event of store.events) {
    const daysUntil = (new Date(event.date).getTime() - now) / 86_400_000
    if (daysUntil > DAYS_BEFORE) continue
    const frozen = freezeEventPredictions(event.id)
    if (frozen > 0) console.log(`Figé ${frozen} pronostic(s) — ${event.name}`)
    total += frozen
  }

  console.log(`Total pronostics figés : ${total}`)
}

main()
