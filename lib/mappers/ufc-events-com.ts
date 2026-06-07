import type { EventSyncResult, ScrapedEvent, ScrapedFight } from '@/lib/event-sync/types'
import { TOP_RANKED_LIMIT } from '@/lib/fighter-ranking'
import { decodeHtmlEntities } from '@/utils/format'

export const UFC_EVENTS_URL = 'https://www.ufc.com/events'
export const UFC_BASE = 'https://www.ufc.com'

const UFC_WEIGHT_FR: Record<string, string> = {
  'poids lourds': 'Heavyweight',
  'poids mi-lourds': 'Light Heavyweight',
  'poids moyens': 'Middleweight',
  'poids mi-moyens': 'Welterweight',
  'poids légers': 'Lightweight',
  'poids legers': 'Lightweight',
  'poids plume': 'Featherweight',
  'poids coq': 'Bantamweight',
  'poids mouche': 'Flyweight',
  'poids paille': "Women's Strawweight",
  'poids coq féminins': "Women's Bantamweight",
  'poids coq feminins': "Women's Bantamweight",
  'poids mouche féminins': "Women's Flyweight",
  'poids mouche feminins': "Women's Flyweight",
  'poids plume féminins': "Women's Featherweight",
  'poids plume feminins': "Women's Featherweight",
  'poids paille féminins': "Women's Strawweight",
  'poids paille feminins': "Women's Strawweight",
  'poids concerté': 'Catchweight',
  'poids concerte': 'Catchweight',
}

export function mapUfcWeightClass(raw: string): string {
  const key = raw
    .replace(/\s*-\s*$/, '')
    .trim()
    .toLowerCase()
  for (const [fr, en] of Object.entries(UFC_WEIGHT_FR)) {
    if (key.includes(fr)) return en
  }
  if (/champion/i.test(raw)) return raw.replace(/\s*-\s*$/, '').trim()
  return raw.replace(/\s*-\s*$/, '').trim() || 'Catchweight'
}

export function parseUfcEventsListingHtml(html: string): {
  slug: string
  headline: string
  mainCardTimestamp?: number
  venueName?: string
  city?: string
  country?: string
}[] {
  const events: ReturnType<typeof parseUfcEventsListingHtml> = []
  const seen = new Set<string>()

  // Nested <article class="c-card--red-blue"> breaks a naive </article> split.
  const cardRe =
    /c-card-event--result__headline"><a href="\/event\/([^"#?]+)">([^<]+)<\/a>[\s\S]*?data-main-card-timestamp="(\d+)"([\s\S]*?)(?=c-card-event--result__headline"|$)/gi

  let m: RegExpExecArray | null
  while ((m = cardRe.exec(html))) {
    const slug = m[1].trim()
    if (seen.has(slug)) continue
    seen.add(slug)

    const tail = m[4]
    const venueName = tail.match(
      /field--name-taxonomy-term-title[^>]*>[\s\S]*?<h5>\s*([^<]+)/,
    )?.[1]?.trim()
    const locality = tail.match(/class="locality">([^<]+)/)?.[1]?.trim()
    const country = tail.match(/class="country">([^<]+)/)?.[1]?.trim()

    events.push({
      slug,
      headline: m[2].trim(),
      mainCardTimestamp: Number(m[3]),
      venueName,
      city: locality,
      country,
    })
  }

  return events
}

function parseVenueBlock(html: string): { venue: string; city: string; country: string } {
  const venueBlock =
    html.match(
      /field--name-venue[\s\S]*?field__item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
    )?.[1] ?? ''

  const lines = venueBlock
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const venue = lines[0]?.replace(/,\s*$/, '') ?? 'TBA'
  const city = lines[1] ?? 'TBA'
  const country = lines[2] ?? 'TBA'

  return { venue, city, country }
}

function parseEventTitle(html: string): string {
  const og = html.match(/<title>([^<|]+)/)?.[1]?.trim()
  if (og) return og.replace(/\s*\|\s*UFC\s*$/i, '').trim()
  return (
    html.match(/field--name-node-title[\s\S]*?<h1>\s*([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ??
    'UFC Event'
  )
}

function parseEventTimestamp(html: string): string | null {
  const ts = html.match(/data-timestamp="(\d+)"/)?.[1]
  if (ts) return new Date(Number(ts) * 1000).toISOString()

  const dt = html.match(
    /field--name-fight-card-time-main[\s\S]*?<time datetime="([^"]+)"/,
  )?.[1]
  return dt ?? null
}

/** Parse « #5 », « C », « #C » depuis la carte UFC.com. */
export function parseUfcRankLabel(raw: string): number | undefined {
  const label = raw.trim().replace(/^#/, '')
  if (/^c$/i.test(label)) return 1
  const n = Number(label)
  if (!Number.isFinite(n) || n < 1 || n > TOP_RANKED_LIMIT) return undefined
  return n
}

function parseUfcFightRanks(block: string): { red?: number; blue?: number } {
  const ranksRow = block.match(
    /c-listing-fight__ranks-row">([\s\S]*?)<\/div>\s*(?=<div class="c-listing-fight__banner|<div class="c-listing-fight__awards|<div class="c-listing-fight__names-row)/i,
  )?.[1]

  if (!ranksRow) return {}

  const labels = [...ranksRow.matchAll(
    /c-listing-fight__corner-rank[^>]*>[\s\S]*?<span>([^<]*)<\/span>/gi,
  )].map((m) => m[1].trim())

  if (labels.length === 0) return {}

  return {
    red: labels[0] ? parseUfcRankLabel(labels[0]) : undefined,
    blue: labels[1] ? parseUfcRankLabel(labels[1]) : undefined,
  }
}

function parseUfcCornerImage(block: string, side: 'red' | 'blue'): string | undefined {
  const chunk = block.match(
    new RegExp(
      `c-listing-fight__corner-image--${side}">([\\s\\S]*?)(?=c-listing-fight__corner-image--|c-listing-fight__banner|c-listing-fight__names-row)`,
      'i',
    ),
  )?.[1]
  const raw = chunk?.match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&')
  if (!raw || /silhouette|comingsoon|flags\//i.test(raw)) return undefined
  return raw.startsWith('http') ? raw : `${UFC_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function decode(raw?: string): string | undefined {
  const trimmed = raw?.trim()
  return trimmed ? decodeHtmlEntities(trimmed) : undefined
}

function parseUfcCornerFromBlock(
  block: string,
  side: 'red' | 'blue',
  ranking?: number,
): ScrapedFight['red'] {
  const cornerChunk = block.match(
    new RegExp(`c-listing-fight__corner-name--${side}">([\\s\\S]*?)</div>`),
  )?.[1]

  if (!cornerChunk) return { fullName: '' }

  const imageUrl = parseUfcCornerImage(block, side)
  const slug = cornerChunk.match(/\/athlete\/([^"?\s#]+)/)?.[1]
  const given = decode(cornerChunk.match(/c-listing-fight__corner-given-name">([^<]+)/)?.[1])
  const family = decode(cornerChunk.match(/c-listing-fight__corner-family-name">([^<]+)/)?.[1])
  const plain = decode(
    cornerChunk.match(/\/athlete\/[^"]+">\s*([^<]+?)\s*<\/a>/)?.[1]?.replace(/\s+/g, ' '),
  )

  const fullName = [given, family].filter(Boolean).join(' ').trim() || plain || ''

  return {
    slug,
    fullName,
    profileUrl: slug ? `${UFC_BASE}/athlete/${slug}` : undefined,
    imageUrl,
    ranking,
  }
}

export function parseUfcEventFightsHtml(html: string): ScrapedFight[] {
  const fights: ScrapedFight[] = []
  const fightRe = /<div class="c-listing-fight"[\s\S]*?(?=<div class="c-listing-fight"|$)/gi

  let m: RegExpExecArray | null
  let order = 0
  while ((m = fightRe.exec(html))) {
    const block = m[0]
    order += 1

    const ranks = parseUfcFightRanks(block)
    const red = parseUfcCornerFromBlock(block, 'red', ranks.red)
    const blue = parseUfcCornerFromBlock(block, 'blue', ranks.blue)

    const wcRaw =
      block.match(/c-listing-fight__class-text">([^<]+)/)?.[1] ?? 'Catchweight'
    const weightClass = mapUfcWeightClass(wcRaw)
    const isTitle =
      /champion|championship|title/i.test(block) || /champion/i.test(wcRaw)
    const isMainEvent = order === 1

    if (!red.fullName || !blue.fullName) continue

    fights.push({
      order,
      red,
      blue,
      weightClass: isTitle && !/championship/i.test(weightClass)
        ? `${weightClass} Championship`
        : weightClass,
      isTitle,
      isMainEvent,
      scheduledRounds: isTitle || isMainEvent ? 5 : 3,
    })
  }

  return fights
}

export function parseUfcEventPageHtml(
  html: string,
  slug: string,
  listingMeta?: ReturnType<typeof parseUfcEventsListingHtml>[0],
): ScrapedEvent | null {
  const fights = parseUfcEventFightsHtml(html)
  if (fights.length === 0) return null

  const { venue, city, country } = parseVenueBlock(html)
  const date =
    parseEventTimestamp(html) ??
    (listingMeta?.mainCardTimestamp
      ? new Date(listingMeta.mainCardTimestamp * 1000).toISOString()
      : new Date().toISOString())

  return {
    sourceId: slug,
    organizationId: 'ufc',
    name: parseEventTitle(html) || listingMeta?.headline || slug,
    date,
    venue: listingMeta?.venueName ?? venue,
    city: listingMeta?.city ?? city,
    country: listingMeta?.country ?? country,
    status: 'upcoming',
    fights,
    scrapeUrl: `${UFC_BASE}/event/${slug}`,
  }
}

export function filterUpcomingUfcSlugs(
  listings: ReturnType<typeof parseUfcEventsListingHtml>,
  now = new Date(),
  max = 6,
): ReturnType<typeof parseUfcEventsListingHtml> {
  return listings
    .filter((e) => {
      if (!e.mainCardTimestamp) return true
      return e.mainCardTimestamp * 1000 >= now.getTime() - 86_400_000
    })
    .slice(0, max)
}

export function emptyUfcSync(): EventSyncResult {
  return { events: [], warnings: [] }
}
