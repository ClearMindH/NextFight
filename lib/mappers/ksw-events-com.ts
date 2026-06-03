import type { ScrapedEvent, ScrapedFight } from '@/lib/event-sync/types'

export const KSW_EVENTS_URL = 'https://www.kswmma.com/en/events'
export const KSW_EVENT_HOME = 'https://www.kswmma.com/en/event-home'
export const KSW_BASE = 'https://www.kswmma.com'

export interface KswEventListing {
  numericId: number
  slug: string
  name: string
  dateLabel: string
  venueLine: string
  mainRed?: string
  mainBlue?: string
  scrapeUrl: string
}

export function parseKswEventsListingHtml(html: string): KswEventListing[] {
  const events: KswEventListing[] = []
  const blockRe =
    /<div class="col-md-6 mt-5">([\s\S]*?)(?=<div class="col-md-6 mt-5"|$)/gi

  let m: RegExpExecArray | null
  while ((m = blockRe.exec(html))) {
    const block = m[1]
    const numericId = Number(block.match(/getEvent\((\d+)\)/)?.[1])
    const slugPath = block.match(/href="https:\/\/www\.kswmma\.com\/en\/event\/([^"]+)"/)?.[1]
    if (!numericId || !slugPath) continue

    const name =
      block.match(/col-sm-6 pt-2 ps-5[^>]*>\s*([^<]+)/)?.[1]?.trim() ?? slugPath
    const dateLabel =
      block.match(/col-sm-6 text-end[^>]*>\s*([^<]+)/)?.[1]?.trim() ?? ''
    const venueLine =
      block.match(/col-sm-12 ps-5 text-uppercase">\s*([^<]+)/)?.[1]?.trim() ?? ''

    const vsMatch = block.match(
      /<h2 class="oswald">\s*([^<]+?)\s*<span[^>]*>vs<\/span>\s*([^<]+)\s*<\/h2>/i,
    )

    events.push({
      numericId,
      slug: slugPath,
      name,
      dateLabel,
      venueLine,
      mainRed: vsMatch?.[1]?.trim(),
      mainBlue: vsMatch?.[2]?.trim(),
      scrapeUrl: `${KSW_BASE}/en/event/${slugPath}`,
    })
  }

  return events
}

function parseKswDate(dateLabel: string): string {
  const dmY = dateLabel.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (dmY) {
    const [, d, mo, y] = dmY
    return new Date(`${y}-${mo}-${d}T17:00:00Z`).toISOString()
  }
  return new Date().toISOString()
}

function parseVenueLine(line: string): { venue: string; city: string; country: string } {
  const parts = line.split(',').map((p) => p.trim())
  if (parts.length >= 2) {
    return { venue: parts[0], city: parts[1], country: 'Poland' }
  }
  return { venue: line || 'TBA', city: 'TBA', country: 'Poland' }
}

export function parseKswEventHomeHtml(html: string, listing: KswEventListing): ScrapedFight[] {
  const fights: ScrapedFight[] = []
  const cardRe =
    /<div class="col-lg-6 col-md-12 mt-4">([\s\S]*?)(?=<div class="col-lg-6 col-md-12 mt-4"|$)/gi

  let m: RegExpExecArray | null
  let order = 0
  while ((m = cardRe.exec(html))) {
    const block = m[1]
    const links = [
      ...block.matchAll(
        /href="https:\/\/www\.kswmma\.com\/en\/fighter\/([^"]+)"[^>]*>[\s\S]*?alt="([^"]*)"/g,
      ),
    ]
    if (links.length < 2) continue

    const redSlug = links[0][1]
    const blueSlug = links[1][1]
    const redName = links[0][2] || redSlug.replace(/-/g, ' ')
    const blueName = links[1][2] || blueSlug.replace(/-/g, ' ')

    const isTitle = /champion/i.test(block)
    order += 1

    fights.push({
      order,
      red: {
        slug: redSlug,
        fullName: redName,
        profileUrl: `${KSW_BASE}/en/fighter/${redSlug}`,
      },
      blue: {
        slug: blueSlug,
        fullName: blueName,
        profileUrl: `${KSW_BASE}/en/fighter/${blueSlug}`,
      },
      weightClass: isTitle ? 'Championship' : 'Catchweight',
      isTitle,
      isMainEvent: order === 1,
      scheduledRounds: isTitle || order === 1 ? 5 : 3,
    })
  }

  if (fights.length === 0 && listing.mainRed && listing.mainBlue) {
    fights.push({
      order: 1,
      red: { fullName: listing.mainRed },
      blue: { fullName: listing.mainBlue },
      weightClass: 'Championship',
      isMainEvent: true,
      isTitle: true,
      scheduledRounds: 5,
    })
  }

  return fights
}

export function buildKswScrapedEvent(
  listing: KswEventListing,
  fightCardHtml: string,
): ScrapedEvent | null {
  const fights = parseKswEventHomeHtml(fightCardHtml, listing)
  if (fights.length === 0) return null

  const { venue, city, country } = parseVenueLine(listing.venueLine)
  const titleMatch = fightCardHtml.match(/gale-title">([^<]+)/)

  return {
    sourceId: listing.slug,
    organizationId: 'ksw',
    name: titleMatch?.[1]?.trim() ?? listing.name,
    date: parseKswDate(listing.dateLabel),
    venue,
    city,
    country,
    status: 'upcoming',
    fights,
    scrapeUrl: listing.scrapeUrl,
  }
}
