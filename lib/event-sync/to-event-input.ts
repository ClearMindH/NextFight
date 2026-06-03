import type { EventInput, FightInput } from '@/types/admin'
import { resolveFighterId } from './resolve-fighter'
import type { ScrapedEvent, ScrapedFight } from './types'

export interface BuildEventResult {
  event: EventInput | null
  skippedFights: { fight: ScrapedFight; reason: string }[]
}

function fightId(eventId: string, order: number): string {
  return `${eventId}-f${order}`
}

function buildFight(
  eventId: string,
  orgId: ScrapedEvent['organizationId'],
  scraped: ScrapedFight,
  order: number,
): { fight: FightInput | null; reason?: string } {
  const redId = resolveFighterId(orgId, scraped.red)
  const blueId = resolveFighterId(orgId, scraped.blue)

  if (!redId || !blueId) {
    return {
      fight: null,
      reason: `Unresolved: ${scraped.red.fullName} vs ${scraped.blue.fullName}`,
    }
  }

  const isTitle = scraped.isTitle ?? /championship/i.test(scraped.weightClass)
  const scheduledRounds =
    scraped.scheduledRounds ?? (isTitle || scraped.isMainEvent ? 5 : 3)

  return {
    fight: {
      id: fightId(eventId, order),
      eventId,
      order,
      weightClass: scraped.weightClass,
      isTitle,
      isMainEvent: scraped.isMainEvent ?? order === 1,
      scheduledRounds,
      redId,
      blueId,
    },
  }
}

export function scrapedEventToInput(
  scraped: ScrapedEvent,
  communityPredictions = 0,
): BuildEventResult {
  const skippedFights: BuildEventResult['skippedFights'] = []
  const fights: FightInput[] = []

  const ordered = [...scraped.fights].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  )

  let order = 1
  for (const sf of ordered) {
    const { fight, reason } = buildFight(scraped.sourceId, scraped.organizationId, sf, order)
    if (fight) {
      fights.push(fight)
      order += 1
    } else if (reason) {
      skippedFights.push({ fight: sf, reason })
    }
  }

  if (fights.length === 0) {
    return { event: null, skippedFights }
  }

  return {
    event: {
      id: scraped.sourceId,
      organizationId: scraped.organizationId,
      name: scraped.name,
      date: scraped.date,
      venue: scraped.venue,
      city: scraped.city,
      country: scraped.country,
      status: scraped.status,
      communityPredictions,
      fights,
    },
    skippedFights,
  }
}
