import type { EventSyncResult, ScrapedEvent, ScrapedFight } from '@/lib/event-sync/types'

export const PFL_EVENTS_URL = 'https://pflmma.com/events'
export const PFL_BASE = 'https://pflmma.com'

export interface PflEventListing {
  slug: string
  name: string
  dateLabel: string
  scrapeUrl: string
}

export function parsePflEventsListingHtml(html: string): PflEventListing[] {
  const events: PflEventListing[] = []
  const hubRe =
    /<div class="event-hub[^"]*"[\s\S]*?onclick="[^"]*\/event\/([^'"]+)[\s\S]*?<h6[^>]*>([^<]+)<\/h6>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/gi

  let m: RegExpExecArray | null
  while ((m = hubRe.exec(html))) {
    const slug = m[1].trim()
    if (events.some((e) => e.slug === slug)) continue
    events.push({
      slug,
      name: m[3].trim(),
      dateLabel: m[2].trim(),
      scrapeUrl: `${PFL_BASE}/event/${slug}`,
    })
  }

  const heroRe =
    /<h3>([^<]+)<\/h3>[\s\S]{0,800}?href="\/event\/([^"]+)"/gi
  while ((m = heroRe.exec(html))) {
    const slug = m[2].trim()
    if (events.some((e) => e.slug === slug)) continue
    events.push({
      slug,
      name: m[1].trim(),
      dateLabel: '',
      scrapeUrl: `${PFL_BASE}/event/${slug}`,
    })
  }

  return events
}

export function parsePflEventDateIso(html: string, slug: string): string {
  const iso = html.match(/DateTime\.fromISO\("([^"]+)"/)?.[1]
  if (iso) return new Date(iso).toISOString()

  const gcal = html.match(/dates=(\d{8}T\d{6})/)?.[1]
  if (gcal) {
    const y = gcal.slice(0, 4)
    const mo = gcal.slice(4, 6)
    const d = gcal.slice(6, 8)
    const h = gcal.slice(9, 11)
    const mi = gcal.slice(11, 13)
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`).toISOString()
  }

  return new Date().toISOString()
}

export function parsePflFightCardHtml(html: string): ScrapedFight[] {
  const fights: ScrapedFight[] = []
  const rowRe =
    /<div class="row fightcard[^"]*"[^>]*id="fightCardRow(\d+)"([\s\S]*?)(?=<div class="row fightcard|$)/gi

  let m: RegExpExecArray | null
  while ((m = rowRe.exec(html))) {
    const block = m[2]
    const order = Number(m[1])
    const slugs = [
      ...new Set(
        [...block.matchAll(/href="https:\/\/pflmma\.com\/fighter\/([^"]+)"/g)].map(
          (x) => x[1],
        ),
      ),
    ]
    if (slugs.length < 2) continue

    const wc =
      block.match(/class="[^"]*weight[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim() ??
      block.match(/data-weightclass="([^"]+)"/i)?.[1]?.trim() ??
      'Catchweight'

    const isTitle = /champion|title bout|belt/i.test(block)
    const isMainEvent = order === 1

    const nameFromSlug = (slug: string) =>
      slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

    fights.push({
      order,
      red: {
        slug: slugs[0],
        fullName: nameFromSlug(slugs[0]),
        profileUrl: `${PFL_BASE}/fighter/${slugs[0]}`,
      },
      blue: {
        slug: slugs[1],
        fullName: nameFromSlug(slugs[1]),
        profileUrl: `${PFL_BASE}/fighter/${slugs[1]}`,
      },
      weightClass: wc,
      isTitle,
      isMainEvent,
      scheduledRounds: isTitle || isMainEvent ? 5 : 3,
    })
  }

  return fights.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function parsePflEventMetaHtml(html: string, listing: PflEventListing): Omit<
  ScrapedEvent,
  'fights' | 'organizationId' | 'status'
> {
  const rawLocation = html.match(/location=([^&"]+)/)?.[1]
  const venue = rawLocation
    ? decodeURIComponent(rawLocation.replace(/\+/g, ' '))
    : 'TBA'
  const city = venue.includes('–')
    ? venue.split('–')[1]?.trim() ?? 'San Diego'
    : venue.includes(',')
      ? venue.split(',').pop()?.trim() ?? 'TBA'
      : 'TBA'

  return {
    sourceId: listing.slug,
    name: listing.name,
    date: parsePflEventDateIso(html, listing.slug),
    venue: venue.split('–')[0]?.trim() ?? venue.split(',')[0]?.trim() ?? venue,
    city,
    country: 'USA',
    scrapeUrl: listing.scrapeUrl,
  }
}

export function emptyPflSync(): EventSyncResult {
  return { events: [], warnings: [] }
}

/** Best-effort ISO date from hub label e.g. "Sat, Jun 27". */
export function guessDateFromPflLabel(label: string, year = new Date().getFullYear()): string | null {
  const m = label.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+(\w+)\s+(\d{1,2})/i)
  if (!m) return null
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  }
  const mo = months[m[2].slice(0, 3).toLowerCase()]
  if (mo === undefined) return null
  const day = Number(m[3])
  return new Date(Date.UTC(year, mo, day, 23, 0, 0)).toISOString()
}
