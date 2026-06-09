import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import type { Event, Fight } from '@/types'
import type { EventInput, EventsStoreFile, FightInput } from '@/types/admin'
import { PredictionEngine } from '@/services/PredictionEngine'
import { mergeFighterForDisplay } from '@/lib/fighter-display'
import { getFighterFromStore } from '@/lib/roster-store'
import { buildPredictionSnapshot } from '@/lib/prediction-snapshot'
import { deriveFightResult } from '@/lib/derive-fight-result'
import { applyMarketOdds } from '@/lib/prediction/market-odds'

const STORE_PATH = path.join(process.cwd(), 'data', 'store', 'events.json')

/** Pas d’événements fictifs : le store est alimenté par `npm run sync:events`. */
const SEED_EVENTS: EventInput[] = []

function ensureStore(): EventsStoreFile {
  const dir = path.dirname(STORE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  if (!existsSync(STORE_PATH)) {
    const initial: EventsStoreFile = {
      events: SEED_EVENTS,
      updatedAt: new Date().toISOString(),
    }
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8')
    return initial
  }

  return JSON.parse(readFileSync(STORE_PATH, 'utf-8')) as EventsStoreFile
}

export function loadEventsRaw(): EventsStoreFile {
  return ensureStore()
}

let hydratedCache: { updatedAt: string; events: Event[] } | null = null

function invalidateHydratedCache(): void {
  hydratedCache = null
}

/** Force le rechargement des combattants (pays, records) après mise à jour roster. */
export function invalidateEventsHydratedCache(): void {
  invalidateHydratedCache()
}

export function saveEventsRaw(data: EventsStoreFile): void {
  const dir = path.dirname(STORE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(
    STORE_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8',
  )
  invalidateHydratedCache()
}

function hydrateFight(input: FightInput): Fight | null {
  const redRaw = getFighterFromStore(input.redId)
  const blueRaw = getFighterFromStore(input.blueId)
  if (!redRaw || !blueRaw) return null

  const redCorner = mergeFighterForDisplay(redRaw)
  const blueCorner = mergeFighterForDisplay(blueRaw)

  const rawPrediction = PredictionEngine.predict({
    fighterA: redCorner,
    fighterB: blueCorner,
    scheduledRounds: input.scheduledRounds,
  })
  const prediction = applyMarketOdds(
    rawPrediction,
    input.id,
    redCorner.id,
    blueCorner.id,
  )

  return {
    ...input,
    redCorner:
      prediction.breakdown.form && prediction.breakdown.form.fighterA.bouts.length > 0
        ? { ...redCorner, recentBouts: prediction.breakdown.form.fighterA.bouts }
        : redCorner,
    blueCorner:
      prediction.breakdown.form && prediction.breakdown.form.fighterB.bouts.length > 0
        ? { ...blueCorner, recentBouts: prediction.breakdown.form.fighterB.bouts }
        : blueCorner,
    model: PredictionEngine.toFightModel(prediction),
  }
}

export function hydrateEvent(input: EventInput): Event {
  const fights = input.fights
    .map(hydrateFight)
    .filter((f): f is Fight => f !== null)
    .sort((a, b) => a.order - b.order)

  return { ...input, fights }
}

export function loadEventsHydrated(): Event[] {
  const raw = loadEventsRaw()
  if (hydratedCache && hydratedCache.updatedAt === raw.updatedAt) {
    return hydratedCache.events
  }
  const events = raw.events.map(hydrateEvent)
  hydratedCache = { updatedAt: raw.updatedAt, events }
  return events
}

export function upsertEventInput(event: EventInput): void {
  const store = loadEventsRaw()
  const index = store.events.findIndex((e) => e.id === event.id)
  const events = [...store.events]
  if (index >= 0) events[index] = event
  else events.push(event)
  saveEventsRaw({ events, updatedAt: new Date().toISOString() })
}

export function addFightToEvent(eventId: string, fight: FightInput): void {
  const store = loadEventsRaw()
  const event = store.events.find((e) => e.id === eventId)
  if (!event) throw new Error(`Event not found: ${eventId}`)
  const fights = event.fights.filter((f) => f.id !== fight.id)
  fights.push(fight)
  upsertEventInput({ ...event, fights })
}

/**
 * Fige le pronostic courant d'un événement dans le store (n'écrase jamais un
 * snapshot déjà présent). Renvoie le nombre de combats nouvellement figés.
 */
export function freezeEventPredictions(eventId: string): number {
  const store = loadEventsRaw()
  const rawEvent = store.events.find((e) => e.id === eventId)
  if (!rawEvent) return 0

  const hydrated = hydrateEvent(rawEvent)
  const byId = new Map(hydrated.fights.map((f) => [f.id, f]))

  let frozen = 0
  const fights = rawEvent.fights.map((fi) => {
    if (fi.predictionSnapshot) return fi
    const hf = byId.get(fi.id)
    if (!hf) return fi
    frozen += 1
    return { ...fi, predictionSnapshot: buildPredictionSnapshot(hf) }
  })

  if (frozen > 0) upsertEventInput({ ...rawEvent, fights })
  return frozen
}

/**
 * Renseigne les résultats réels des événements passés à partir des `recentBouts`
 * (scrapés) des combattants, et bascule l'événement en `completed` une fois tous
 * les combats résolus. Nécessite un resync préalable du roster.
 */
export function syncPastEventResults(opts?: {
  maxMonthsAgo?: number
}): { eventsUpdated: number; resultsResolved: number } {
  const store = loadEventsRaw()
  const now = Date.now()
  let eventsUpdated = 0
  let resultsResolved = 0

  const events = store.events.map((rawEvent) => {
    const isPast = new Date(rawEvent.date).getTime() < now
    if (!isPast) return rawEvent

    const hydrated = hydrateEvent(rawEvent)
    const byId = new Map(hydrated.fights.map((f) => [f.id, f]))

    let changed = false
    const fights = rawEvent.fights.map((fi) => {
      if (fi.result) return fi
      const hf = byId.get(fi.id)
      if (!hf) return fi
      const result = deriveFightResult(hf.redCorner, hf.blueCorner, opts?.maxMonthsAgo)
      if (!result) return fi
      resultsResolved += 1
      changed = true
      return { ...fi, result }
    })

    if (!changed) return rawEvent
    eventsUpdated += 1
    const allResolved = fights.every((f) => f.result)
    return { ...rawEvent, fights, status: allResolved ? ('completed' as const) : rawEvent.status }
  })

  if (eventsUpdated > 0) saveEventsRaw({ ...store, events })
  return { eventsUpdated, resultsResolved }
}

export function recalculateAllPredictions(): { updated: number; skipped: number } {
  const store = loadEventsRaw()
  let updated = 0
  let skipped = 0

  for (const event of store.events) {
    for (const fight of event.fights) {
      const red = getFighterFromStore(fight.redId)
      const blue = getFighterFromStore(fight.blueId)
      if (!red || !blue) {
        skipped += 1
        continue
      }
      updated += 1
    }
  }

  saveEventsRaw(store)
  return { updated, skipped }
}
