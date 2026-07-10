/**
 * Sync upcoming UFC events + fight cards from ufc.com.
 * Writes data/store/events.json (hydrated on read via PredictionEngine).
 *
 * Prerequisite: npm run sync:ufc-roster
 *
 * Usage:
 *   npm run sync:events
 *   npm run sync:events:weekend
 */
import { loadEventsRaw, saveEventsRaw } from '../lib/events-store'
import {
  filterEventsInWeekend,
  getThisWeekendWindow,
  isDateInWeekend,
} from '../lib/event-sync/weekend'
import { fetchText } from '../lib/event-sync/fetch'
import { ensureCardFightersInRoster } from '../lib/event-sync/ensure-card-fighters'
import { scrapedEventToInput } from '../lib/event-sync/to-event-input'
import type { ScrapedEvent } from '../lib/event-sync/types'
import {
  filterUpcomingUfcSlugs,
  parseUfcEventPageHtml,
  parseUfcEventsListingHtml,
  UFC_BASE,
  UFC_EVENTS_URL,
} from '../lib/mappers/ufc-events-com'
import type { EventInput } from '../types/admin'

const DELAY_MS = 400
const UFC_MAX = 6

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
      } else warnings.push(`UFC ${listing.slug}: no fights parsed`)
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

async function main(): Promise<void> {
  const store = loadEventsRaw()
  const existing = store.events.filter((e) => e.organizationId === 'ufc')
  const allWarnings: string[] = []
  const window = getThisWeekendWindow()

  console.log(
    weekendOnly
      ? `NextFight — sync UFC week-end (${window.label})\n`
      : 'NextFight — sync UFC upcoming events\n',
  )

  const ufc = await syncUfc(existing, window)
  allWarnings.push(...ufc.warnings)

  let merged = [...ufc.events]

  if (weekendOnly) {
    merged = filterEventsInWeekend(merged, window)
  }

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
