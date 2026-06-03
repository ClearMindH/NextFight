import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import type { Event, Fight } from '@/types'
import type { EventInput, EventsStoreFile, FightInput } from '@/types/admin'
import { PredictionEngine } from '@/services/PredictionEngine'
import { mergeFighterForDisplay } from '@/lib/fighter-display'
import { getFighterFromStore } from '@/lib/roster-store'

const STORE_PATH = path.join(process.cwd(), 'data', 'store', 'events.json')

const SEED_EVENTS: EventInput[] = [
  {
    id: 'ufc-313',
    organizationId: 'ufc',
    name: 'UFC 313',
    date: '2026-06-14T22:00:00Z',
    venue: 'T-Mobile Arena',
    city: 'Las Vegas',
    country: 'USA',
    status: 'upcoming',
    communityPredictions: 18420,
    fights: [
      {
        id: 'ufc-313-main',
        eventId: 'ufc-313',
        order: 1,
        weightClass: 'Heavyweight Championship',
        isTitle: true,
        isMainEvent: true,
        scheduledRounds: 5,
        redId: 'ufc-jon-jones',
        blueId: 'ufc-tom-aspinall',
      },
    ],
  },
  {
    id: 'ufc-fight-night-257',
    organizationId: 'ufc',
    name: 'UFC Fight Night 257',
    date: '2026-06-28T19:00:00Z',
    venue: 'UFC APEX',
    city: 'Las Vegas',
    country: 'USA',
    status: 'upcoming',
    communityPredictions: 6210,
    fights: [
      {
        id: 'ufn-257-main',
        eventId: 'ufc-fight-night-257',
        order: 1,
        weightClass: 'Welterweight',
        isTitle: false,
        isMainEvent: true,
        scheduledRounds: 5,
        redId: 'ufc-leon-edwards',
        blueId: 'ufc-jack-della-maddalena',
      },
    ],
  },
  {
    id: 'pfl-2026-w2',
    organizationId: 'pfl',
    name: 'PFL 2026 — Week 2',
    date: '2026-06-07T01:00:00Z',
    venue: 'Intuit Dome',
    city: 'Inglewood',
    country: 'USA',
    status: 'upcoming',
    communityPredictions: 3890,
    fights: [
      {
        id: 'pfl-w2-main',
        eventId: 'pfl-2026-w2',
        order: 1,
        weightClass: 'Heavyweight Tournament',
        isTitle: false,
        isMainEvent: true,
        scheduledRounds: 3,
        redId: 'pfl-oleg-popov',
        blueId: 'pfl-sergey-bilostenniy',
      },
    ],
  },
  {
    id: 'ksw-100',
    organizationId: 'ksw',
    name: 'KSW 100',
    date: '2026-06-21T18:00:00Z',
    venue: 'PGE Narodowy',
    city: 'Warsaw',
    country: 'Poland',
    status: 'upcoming',
    communityPredictions: 5120,
    fights: [
      {
        id: 'ksw-100-main',
        eventId: 'ksw-100',
        order: 1,
        weightClass: 'Middleweight Championship',
        isTitle: true,
        isMainEvent: true,
        scheduledRounds: 5,
        redId: 'ksw-mamed-chalidow',
        blueId: 'ksw-adrian-bartosinski',
      },
    ],
  },
  {
    id: 'ares-32',
    organizationId: 'ares',
    name: 'ARES 32',
    date: '2026-07-05T19:00:00Z',
    venue: 'Accor Arena',
    city: 'Paris',
    country: 'France',
    status: 'upcoming',
    communityPredictions: 2940,
    fights: [
      {
        id: 'ares-32-main',
        eventId: 'ares-32',
        order: 1,
        weightClass: 'Heavyweight',
        isTitle: true,
        isMainEvent: true,
        scheduledRounds: 5,
        redId: 'ares-alexander-soldatkin',
        blueId: 'ares-arif-krasniqi',
      },
    ],
  },
  {
    id: 'hexagone-24',
    organizationId: 'hexagone',
    name: 'Hexagone MMA 24',
    date: '2026-07-12T23:00:00Z',
    venue: 'Bell Centre',
    city: 'Montreal',
    country: 'Canada',
    status: 'upcoming',
    communityPredictions: 1870,
    fights: [
      {
        id: 'hex-24-main',
        eventId: 'hexagone-24',
        order: 1,
        weightClass: 'Middleweight',
        isTitle: true,
        isMainEvent: true,
        scheduledRounds: 5,
        redId: 'hexagone-alexandro-macedo',
        blueId: 'hexagone-alexis-fontes-2',
      },
    ],
  },
]

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

export function saveEventsRaw(data: EventsStoreFile): void {
  const dir = path.dirname(STORE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(
    STORE_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8',
  )
}

function hydrateFight(input: FightInput): Fight | null {
  const redRaw = getFighterFromStore(input.redId)
  const blueRaw = getFighterFromStore(input.blueId)
  if (!redRaw || !blueRaw) return null

  const redCorner = mergeFighterForDisplay(redRaw)
  const blueCorner = mergeFighterForDisplay(blueRaw)

  const prediction = PredictionEngine.predict({
    fighterA: redCorner,
    fighterB: blueCorner,
    scheduledRounds: input.scheduledRounds,
  })

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
  return raw.events.map(hydrateEvent)
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
