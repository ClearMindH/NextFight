import type { ScrapedEvent, ScrapedFight } from '@/lib/event-sync/types'

export const ARES_EVENTS_URL = 'https://www.aresfighting.com/fr/events/'
export const ARES_BASE = 'https://www.aresfighting.com'

export interface AresEventListing {
  competitionId: number
  name: string
  dateLabel: string
  mainFightLabel?: string
}

export function parseAresEventsListingHtml(html: string): AresEventListing[] {
  const events: AresEventListing[] = []

  const countdownName = html.match(
    /countdownBloc[^>]*>[\s\S]*?event-name[^>]*>([^<]+)</,
  )?.[1]?.trim()
  const countdownFight = html
    .match(/countdownBloc[\s\S]*?<\/span><br>([^<]+)/)?.[1]
    ?.replace(/\t/g, '')
    .trim()

  const compRe =
    /<div class="competition-resume upcoming" title="([^"]+)">([\s\S]*?)(?=<div class="competition-resume|$)/gi

  let m: RegExpExecArray | null
  while ((m = compRe.exec(html))) {
    const title = m[1].trim()
    const block = m[2]
    const competitionId = Number(block.match(/\?competition=(\d+)/)?.[1])
    const dateLabel =
      block.match(/<div class="date">([\s\S]*?)<\/div>/)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ??
      ''

    const listing: AresEventListing = {
      competitionId: competitionId || 0,
      name: title,
      dateLabel,
      mainFightLabel: events.length === 0 ? countdownFight : undefined,
    }

    if (events.length === 0 && countdownName) {
      listing.name = countdownName
      listing.mainFightLabel = countdownFight
    }

    if (competitionId) events.push(listing)
  }

  return events
}

function parseAresDate(dateLabel: string, html?: string): string {
  const isoFromScript = html?.match(/Date\.parse\("([^"]+)"/)?.[1]
  if (isoFromScript) {
    const d = new Date(isoFromScript)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }

  const dmy = dateLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (dmy) {
    const [, d, mo, y] = dmy
    return new Date(`${y}-${mo}-${d}T19:00:00Z`).toISOString()
  }

  const longFr = dateLabel.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i)
  if (longFr) {
    const months: Record<string, string> = {
      janvier: '01',
      fevrier: '02',
      février: '02',
      mars: '03',
      avril: '04',
      mai: '05',
      juin: '06',
      juillet: '07',
      aout: '08',
      août: '08',
      septembre: '09',
      octobre: '10',
      novembre: '11',
      decembre: '12',
      décembre: '12',
    }
    const mo = months[longFr[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
    if (mo) {
      const day = longFr[1].padStart(2, '0')
      return new Date(`${longFr[3]}-${mo}-${day}T19:00:00Z`).toISOString()
    }
  }

  return new Date().toISOString()
}

export function parseAresFightCardHtml(html: string): ScrapedFight[] {
  const fights: ScrapedFight[] = []
  const lineRe =
    /<div class="fighter-line[^"]*"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="fighter-line|$)/gi

  let m: RegExpExecArray | null
  let order = 0
  while ((m = lineRe.exec(html))) {
    const block = m[1]
    const weightClass =
      block.match(/<div class="fight-name">[\s\S]*?<h3>([^<]+)/)?.[1]?.trim() ??
      'Catchweight'

    const redName =
      block.match(/fighter-one[\s\S]*?<h4>([^<]+)/)?.[1]?.trim() ??
      block.match(/fighter-one[\s\S]*?alt="([^"]+)"/)?.[1]?.trim()
    const blueName =
      block.match(/fighter-two[\s\S]*?<h4>([^<]+)/)?.[1]?.trim() ??
      block.match(/fighter-two[\s\S]*?alt="([^"]+)"/)?.[1]?.trim()

    if (!redName || !blueName) continue

    order += 1
    const isTitle = /champion|title/i.test(block) || /champion/i.test(weightClass)

    fights.push({
      order,
      red: { fullName: redName },
      blue: { fullName: blueName },
      weightClass,
      isTitle,
      isMainEvent: order === 1,
      scheduledRounds: isTitle || order === 1 ? 5 : 3,
    })
  }

  return fights
}

export function buildAresScrapedEvent(
  listing: AresEventListing,
  fightCardHtml: string,
  pageHtml: string,
): ScrapedEvent | null {
  let fights = parseAresFightCardHtml(fightCardHtml)

  if (fights.length === 0 && listing.mainFightLabel) {
    const vs = listing.mainFightLabel.match(/(.+?)\s+contre\s+(.+)/i)
    if (vs) {
      fights = [
        {
          order: 1,
          red: { fullName: vs[1].trim() },
          blue: { fullName: vs[2].trim() },
          weightClass: 'Main Event',
          isMainEvent: true,
          scheduledRounds: 5,
        },
      ]
    }
  }

  if (fights.length === 0) return null

  const sourceId = `ares-${listing.competitionId}`

  return {
    sourceId,
    organizationId: 'ares',
    name: listing.name,
    date: parseAresDate(listing.dateLabel, pageHtml),
    venue: 'TBA',
    city: 'Paris',
    country: 'France',
    status: 'upcoming',
    fights,
    scrapeUrl: `${ARES_EVENTS_URL}?competition=${listing.competitionId}`,
  }
}
