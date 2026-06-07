/**
 * Sync upcoming events + fight cards from official promotion sites.
 * Writes data/store/events.json (hydrated on read via PredictionEngine).
 *
 * Prerequisite: rosters synced (npm run sync:ufc-roster, etc.)
 *
 * Usage:
 *   npm run sync:events              # prochains événements (limite par org)
 *   npm run sync:events:weekend    # uniquement le week-end en cours (sam–dim UTC)
 */
import { loadEventsRaw, saveEventsRaw } from '../lib/events-store'
import {
  filterEventsInWeekend,
  getThisWeekendWindow,
  isDateInWeekend,
} from '../lib/event-sync/weekend'
import { fetchText, fetchWithCookies, type CookieJar } from '../lib/event-sync/fetch'
import { ensureCardFightersInRoster } from '../lib/event-sync/ensure-card-fighters'
import { scrapedEventToInput } from '../lib/event-sync/to-event-input'
import type { ScrapedEvent } from '../lib/event-sync/types'
import {
  ARES_EVENTS_URL,
  buildAresScrapedEvent,
  parseAresEventsListingHtml,
} from '../lib/mappers/ares-events-com'
import {
  buildKswScrapedEvent,
  KSW_EVENTS_URL,
  KSW_EVENT_HOME,
  parseKswEventsListingHtml,
} from '../lib/mappers/ksw-events-com'
import {
  PFL_BASE,
  PFL_EVENTS_URL,
  parsePflEventMetaHtml,
  guessDateFromPflLabel,
  parsePflEventsListingHtml,
  parsePflFightCardHtml,
} from '../lib/mappers/pfl-events-com'
import {
  filterUpcomingUfcSlugs,
  parseUfcEventPageHtml,
  parseUfcEventsListingHtml,
  UFC_BASE,
  UFC_EVENTS_URL,
} from '../lib/mappers/ufc-events-com'
import type { EventInput } from '../types/admin'
import type { OrganizationId } from '../types'

const DELAY_MS = 400
const UFC_MAX = 6
const PFL_MAX = 4
const KSW_MAX = 3
const ARES_MAX = 3

const weekendOnly = process.argv.includes('--weekend')

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function preserveCommunityCount(
  existing: EventInput[],
  id: string,
): number | undefined {
  const n = existing.find((e) => e.id === id)?.communityPredictions
  return n != null && n > 0 ? n : undefined
}

async function syncUfc(
  existing: EventInput[],
  window?: ReturnType<typeof getThisWeekendWindow>,
): Promise<{
  events: EventInput[]
  warnings: string[]
}> {
  const warnings: string[] = []
  const listingHtml = await fetchText(UFC_EVENTS_URL)
  let listings = filterUpcomingUfcSlugs(
    parseUfcEventsListingHtml(listingHtml),
    new Date(),
    weekendOnly ? 20 : UFC_MAX,
  )

  if (weekendOnly && window) {
    listings = listings.filter((l) => {
      if (!l.mainCardTimestamp) return false
      return isDateInWeekend(
        new Date(l.mainCardTimestamp * 1000).toISOString(),
        window,
      )
    })
  }

  console.log(`UFC: ${listings.length} upcoming event(s) to fetch…`)

  const scraped: ScrapedEvent[] = []
  for (const listing of listings) {
    await sleep(DELAY_MS)
    try {
      const html = await fetchText(`${UFC_BASE}/event/${listing.slug}`)
      const event = parseUfcEventPageHtml(html, listing.slug, listing)
      if (event) {
        ensureCardFightersInRoster(event)
        scraped.push(event)
      }
      else warnings.push(`UFC ${listing.slug}: no fights parsed`)
    } catch (e) {
      warnings.push(`UFC ${listing.slug}: ${(e as Error).message}`)
    }
  }

  const events: EventInput[] = []
  for (const s of scraped) {
    const { event, skippedFights } = scrapedEventToInput(
      s,
      preserveCommunityCount(existing, s.sourceId),
    )
    if (event) events.push(event)
    for (const skip of skippedFights) {
      warnings.push(`${s.name}: ${skip.reason}`)
    }
  }

  return { events, warnings }
}

async function openPflSession(): Promise<{
  jar: CookieJar
  csrf: string
}> {
  const jar: CookieJar = new Map()
  const res = await fetchWithCookies(`${PFL_BASE}/events`, jar)
  if (!res.ok) throw new Error(`HTTP ${res.status} opening PFL session`)
  const html = await res.text()
  const csrf =
    html.match(/data-csrf="([^"]+)"/)?.[1] ??
    html.match(/'X-CSRF-TOKEN':\s*'([^']+)'/)?.[1]
  if (!csrf) throw new Error('PFL CSRF token not found')
  return { jar, csrf }
}

async function fetchPflFightCard(
  jar: CookieJar,
  csrf: string,
  eventSlug: string,
): Promise<string> {
  const res = await fetchWithCookies(`${PFL_BASE}/ajax/get_fight_card_component`, jar, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-TOKEN': csrf,
    },
    body: new URLSearchParams({ event_tag: eventSlug, is_mobile: '0' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} PFL fight card ${eventSlug}`)
  return res.text()
}

async function syncPfl(
  existing: EventInput[],
  window?: ReturnType<typeof getThisWeekendWindow>,
): Promise<{
  events: EventInput[]
  warnings: string[]
}> {
  const warnings: string[] = []
  const { jar, csrf } = await openPflSession()
  const listingHtml = await fetchText(PFL_EVENTS_URL)
  let listings = parsePflEventsListingHtml(listingHtml).slice(0, weekendOnly ? 20 : PFL_MAX)

  if (weekendOnly && window) {
    listings = listings.filter((l) => {
      const guess = guessDateFromPflLabel(l.dateLabel)
      return guess ? isDateInWeekend(guess, window) : false
    })
  }

  console.log(`PFL: ${listings.length} event(s)…`)

  const events: EventInput[] = []
  for (const listing of listings) {
    await sleep(DELAY_MS)
    try {
      const pageRes = await fetchWithCookies(listing.scrapeUrl, jar)
      const pageHtml = await pageRes.text()
      const cardHtml = await fetchPflFightCard(jar, csrf, listing.slug)
      const fights = parsePflFightCardHtml(cardHtml)
      if (fights.length === 0) {
        warnings.push(`PFL ${listing.slug}: empty fight card`)
        continue
      }
      const meta = parsePflEventMetaHtml(pageHtml, listing)
      const scraped: ScrapedEvent = {
        ...meta,
        organizationId: 'pfl',
        status: 'upcoming',
        fights,
      }
      const { event, skippedFights } = scrapedEventToInput(
        scraped,
        preserveCommunityCount(existing, scraped.sourceId),
      )
      if (event) events.push(event)
      for (const skip of skippedFights) warnings.push(`${listing.name}: ${skip.reason}`)
    } catch (e) {
      warnings.push(`PFL ${listing.slug}: ${(e as Error).message}`)
    }
  }

  return { events, warnings }
}

async function openKswSession(): Promise<{ jar: CookieJar; csrf: string }> {
  const jar: CookieJar = new Map()
  const res = await fetchWithCookies(KSW_EVENTS_URL, jar)
  if (!res.ok) throw new Error(`HTTP ${res.status} opening KSW session`)
  const html = await res.text()
  const csrf = html.match(/name="csrf-token"\s+content="([^"]+)"/)?.[1]
  if (!csrf) throw new Error('KSW CSRF token not found')
  return { jar, csrf }
}

async function fetchKswEventsHtml(jar: CookieJar, csrf: string): Promise<string> {
  const res = await fetchWithCookies('https://www.kswmma.com/en/filters', jar, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
      Referer: KSW_EVENTS_URL,
    },
    body: JSON.stringify({
      type: 'event',
      filters: {
        'event-status': 'upcoming',
        year: '',
        country: '',
        search: '',
        page: 1,
      },
      lang_id: 1,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} KSW events filter`)
  return res.text()
}

async function fetchKswEventHome(
  jar: CookieJar,
  csrf: string,
  numericId: number,
): Promise<string> {
  const res = await fetchWithCookies(`${KSW_EVENT_HOME}/${numericId}`, jar, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrf,
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} KSW event-home ${numericId}`)
  return res.text()
}

async function syncKsw(
  existing: EventInput[],
  window?: ReturnType<typeof getThisWeekendWindow>,
): Promise<{
  events: EventInput[]
  warnings: string[]
}> {
  const warnings: string[] = []
  const { jar, csrf } = await openKswSession()
  const listingHtml = await fetchKswEventsHtml(jar, csrf)
  let listings = parseKswEventsListingHtml(listingHtml)
    .filter((e) => {
      const d = e.dateLabel.match(/(\d{2})-(\d{2})-(\d{4})/)
      if (!d) return !weekendOnly
      const iso = new Date(`${d[3]}-${d[2]}-${d[1]}T17:00:00Z`).toISOString()
      if (weekendOnly && window) return isDateInWeekend(iso, window)
      return new Date(iso) >= new Date()
    })
    .slice(0, weekendOnly ? 20 : KSW_MAX)

  console.log(`KSW: ${listings.length} event(s)…`)

  const events: EventInput[] = []
  for (const listing of listings) {
    await sleep(DELAY_MS)
    try {
      const cardHtml = await fetchKswEventHome(jar, csrf, listing.numericId)
      const scraped = buildKswScrapedEvent(listing, cardHtml)
      if (!scraped) {
        warnings.push(`KSW ${listing.slug}: no fights`)
        continue
      }
      const { event, skippedFights } = scrapedEventToInput(
        scraped,
        preserveCommunityCount(existing, scraped.sourceId),
      )
      if (event) events.push(event)
      for (const skip of skippedFights) warnings.push(`${listing.name}: ${skip.reason}`)
    } catch (e) {
      warnings.push(`KSW ${listing.slug}: ${(e as Error).message}`)
    }
  }

  return { events, warnings }
}

async function syncAres(
  existing: EventInput[],
  window?: ReturnType<typeof getThisWeekendWindow>,
): Promise<{
  events: EventInput[]
  warnings: string[]
}> {
  const warnings: string[] = []
  const listingHtml = await fetchText(ARES_EVENTS_URL)
  let listings = parseAresEventsListingHtml(listingHtml).slice(0, weekendOnly ? 20 : ARES_MAX)

  if (weekendOnly && window) {
    listings = listings.filter((l) => {
      const dmy = l.dateLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      if (!dmy) return false
      const iso = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T19:00:00Z`).toISOString()
      return isDateInWeekend(iso, window)
    })
  }

  console.log(`ARES: ${listings.length} event(s)…`)

  const events: EventInput[] = []
  for (const listing of listings) {
    if (!listing.competitionId) continue
    await sleep(DELAY_MS)
    try {
      const pageHtml = await fetchText(
        `${ARES_EVENTS_URL}?competition=${listing.competitionId}`,
      )
      const scraped = buildAresScrapedEvent(listing, pageHtml, pageHtml)
      if (!scraped) {
        warnings.push(`ARES ${listing.name}: no fights`)
        continue
      }
      ensureCardFightersInRoster(scraped)
      const { event, skippedFights } = scrapedEventToInput(
        scraped,
        preserveCommunityCount(existing, scraped.sourceId),
      )
      if (event) events.push(event)
      for (const skip of skippedFights) warnings.push(`${listing.name}: ${skip.reason}`)
    } catch (e) {
      warnings.push(`ARES ${listing.name}: ${(e as Error).message}`)
    }
  }

  return { events, warnings }
}

async function main(): Promise<void> {
  const store = loadEventsRaw()
  const existing = store.events
  const allWarnings: string[] = []
  const window = getThisWeekendWindow()

  console.log(
    weekendOnly
      ? `NextFight — sync week-end (${window.label})\n`
      : 'NextFight — sync upcoming events\n',
  )

  const [ufc, pfl, ksw, ares] = await Promise.all([
    syncUfc(existing, window),
    syncPfl(existing, window),
    syncKsw(existing, window),
    syncAres(existing, window),
  ])

  allWarnings.push(...ufc.warnings, ...pfl.warnings, ...ksw.warnings, ...ares.warnings)

  let merged = [
    ...ufc.events,
    ...pfl.events,
    ...ksw.events,
    ...ares.events,
  ]

  if (weekendOnly) {
    merged = filterEventsInWeekend(merged, window)
  }

  // Conserver les événements passés / terminés (avec leurs pronostics figés et
  // résultats) qui ne sont pas réapparus dans le scrape : ils servent au bilan.
  const now = Date.now()
  const mergedIds = new Set(merged.map((e) => e.id))
  const retainedPast = existing.filter(
    (e) =>
      !mergedIds.has(e.id) &&
      (e.status === 'completed' || new Date(e.date).getTime() < now),
  )
  if (retainedPast.length > 0) {
    console.log(`  Conservés (passés) : ${retainedPast.length} event(s)`)
  }

  merged = [...retainedPast, ...merged]
  merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  saveEventsRaw({ events: merged, updatedAt: new Date().toISOString() })

  console.log('\n── Summary ──')
  console.log(`  UFC:  ${ufc.events.length} event(s)`)
  console.log(`  PFL:  ${pfl.events.length} event(s)`)
  console.log(`  KSW:  ${ksw.events.length} event(s)`)
  console.log(`  ARES: ${ares.events.length} event(s)`)
  console.log(`  Total stored: ${merged.length} event(s)`)

  const fightCount = merged.reduce((n, e) => n + e.fights.length, 0)
  console.log(`  Fights: ${fightCount}`)

  if (allWarnings.length > 0) {
    console.log(`\n  Warnings (${allWarnings.length}):`)
    for (const w of allWarnings.slice(0, 25)) console.log(`    • ${w}`)
    if (allWarnings.length > 25) {
      console.log(`    … and ${allWarnings.length - 25} more`)
    }
  }

  console.log('\nDone. Predictions hydrate on next API/page load.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
