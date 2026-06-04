import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  ARES_EVENTS_URL,
  buildAresScrapedEvent,
  parseAresEventsListingHtml,
} from '@/lib/mappers/ares-events-com'
import {
  parseUfcEventPageHtml,
  UFC_BASE,
} from '@/lib/mappers/ufc-events-com'
import { fetchText } from '@/lib/event-sync/fetch'
import { ensureCardFightersInRoster } from '@/lib/event-sync/ensure-card-fighters'
import { getFighterFromStore, upsertFighterInStore } from '@/lib/roster-store'
import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import { isTopRankedInDivision, getDivisionRankingBadge } from '@/lib/fighter-ranking'
import { mergeFighterForDisplay } from '@/lib/fighter-display'
import type { EventInput } from '@/types/admin'
import type { OrganizationId } from '@/types'

const EVENTS_PATH = join(process.cwd(), 'data', 'store', 'events.json')

function loadWeekendEvents(): EventInput[] {
  if (!existsSync(EVENTS_PATH)) return []
  const store = JSON.parse(readFileSync(EVENTS_PATH, 'utf-8')) as { events: EventInput[] }
  return store.events
}

/** Met à jour le roster depuis seeds + fichier roster (sans requête réseau). */
export function refreshRankingsFromRosterForEvent(event: EventInput): number {
  let updated = 0
  for (const fight of event.fights) {
    for (const id of [fight.redId, fight.blueId]) {
      const raw = getFighterFromStore(id)
      if (!raw) continue
      const next = mergeSeedRanking(raw)
      if (
        isTopRankedInDivision(next.ranking) &&
        next.ranking !== raw.ranking
      ) {
        upsertFighterInStore({
          ...next,
          lastSyncedAt: new Date().toISOString(),
        })
        updated += 1
      }
    }
  }
  return updated
}

export async function syncUfcCardRankingsFromEvent(event: EventInput): Promise<number> {
  if (event.organizationId !== 'ufc') return 0
  const url = `${UFC_BASE}/event/${event.id}`
  const html = await fetchText(url)
  const scraped = parseUfcEventPageHtml(html, event.id)
  if (!scraped) return 0
  ensureCardFightersInRoster(scraped)
  return refreshRankingsFromRosterForEvent(event)
}

export async function syncAresCardRankingsFromEvent(event: EventInput): Promise<number> {
  if (event.organizationId !== 'ares') return 0
  const competitionId = Number(event.id.replace(/^ares-/, ''))
  if (!Number.isFinite(competitionId)) return refreshRankingsFromRosterForEvent(event)

  const listingHtml = await fetchText(ARES_EVENTS_URL)
  const listing =
    parseAresEventsListingHtml(listingHtml).find((l) => l.competitionId === competitionId) ??
    ({
      competitionId,
      name: event.name,
      dateLabel: '',
    } as const)

  const pageHtml = await fetchText(`${ARES_EVENTS_URL}?competition=${competitionId}`)
  const scraped = buildAresScrapedEvent(listing, pageHtml, pageHtml)
  if (scraped) ensureCardFightersInRoster(scraped)
  return refreshRankingsFromRosterForEvent(event)
}

export async function syncCardRankingsForEvents(events: EventInput[]): Promise<{
  ufcUpdated: number
  aresUpdated: number
  otherUpdated: number
}> {
  let ufcUpdated = 0
  let aresUpdated = 0
  let otherUpdated = 0

  for (const event of events) {
    if (event.organizationId === 'ufc') {
      ufcUpdated += await syncUfcCardRankingsFromEvent(event)
    } else if (event.organizationId === 'ares') {
      aresUpdated += await syncAresCardRankingsFromEvent(event)
    } else {
      otherUpdated += refreshRankingsFromRosterForEvent(event)
    }
  }

  return { ufcUpdated, aresUpdated, otherUpdated }
}

export type CardRankingAuditRow = {
  eventId: string
  orgId: OrganizationId
  fighterId: string
  name: string
  ranking: number | undefined
  badge: string | null
}

export function auditCardRankings(events: EventInput[]): CardRankingAuditRow[] {
  const rows: CardRankingAuditRow[] = []
  for (const event of events) {
    for (const fight of event.fights) {
      for (const id of [fight.redId, fight.blueId]) {
        const raw = getFighterFromStore(id)
        if (!raw) {
          rows.push({
            eventId: event.id,
            orgId: event.organizationId,
            fighterId: id,
            name: '?',
            ranking: undefined,
            badge: null,
          })
          continue
        }
        const disp = mergeFighterForDisplay(raw)
        rows.push({
          eventId: event.id,
          orgId: event.organizationId,
          fighterId: id,
          name: raw.name,
          ranking: disp.ranking,
          badge: getDivisionRankingBadge(disp.ranking),
        })
      }
    }
  }
  return rows
}

export function loadWeekendEventsFromStore(): EventInput[] {
  return loadWeekendEvents()
}
