import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildAresScrapedEvent,
  parseAresEventsListingHtml,
  parseAresFightCardHtml,
} from '@/lib/mappers/ares-events-com'
import {
  buildKswScrapedEvent,
  parseKswEventsListingHtml,
} from '@/lib/mappers/ksw-events-com'
import {
  parsePflEventsListingHtml,
  parsePflFightCardHtml,
} from '@/lib/mappers/pfl-events-com'
import {
  parseUfcEventFightsHtml,
  parseUfcEventsListingHtml,
  parseUfcRankLabel,
  mapUfcWeightClass,
} from '@/lib/mappers/ufc-events-com'

const FIXTURE = (name: string) =>
  readFileSync(new URL(`../../test-fixtures/${name}`, import.meta.url), 'utf-8')

describe('UFC events parser', () => {
  it('maps French weight classes', () => {
    expect(mapUfcWeightClass('Poids mi-moyens -')).toBe('Welterweight')
    expect(mapUfcWeightClass('Poids moyens -')).toBe('Middleweight')
  })

  it('parses listing headlines', () => {
    const html = FIXTURE('ufc-events-snippet.html')
    const events = parseUfcEventsListingHtml(html)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].slug).toBe('ufc-fight-night-june-06-2026')
    expect(events[0].headline).toBe('Muhammad vs Bonfim')
    expect(events[0].mainCardTimestamp).toBe(1780790400)
  })

  it('parses fight corners from event page snippet', () => {
    const html = FIXTURE('ufc-event-fight-snippet.html')
    const fights = parseUfcEventFightsHtml(html)
    expect(fights.length).toBe(1)
    expect(fights[0].red.slug).toBe('belal-muhammad')
    expect(fights[0].blue.fullName).toContain('Bonfim')
    expect(fights[0].red.ranking).toBe(5)
    expect(fights[0].blue.ranking).toBe(11)
  })

  it('parses ranks per corner without duplicating a single rank to both', () => {
    const html = FIXTURE('ufc-event-fight-allen-snippet.html')
    const fights = parseUfcEventFightsHtml(html)
    expect(fights.length).toBe(1)
    expect(fights[0].red.ranking).toBe(4)
    expect(fights[0].blue.ranking).toBeUndefined()
    expect(fights[0].blue.slug).toBe('etomen-shiyahashian')
  })

  it('parses UFC rank labels', () => {
    expect(parseUfcRankLabel('#5')).toBe(5)
    expect(parseUfcRankLabel('C')).toBe(1)
    expect(parseUfcRankLabel('#C')).toBe(1)
    expect(parseUfcRankLabel('#16')).toBeUndefined()
  })
})

describe('PFL events parser', () => {
  it('parses event hubs', () => {
    const html = FIXTURE('pfl-events-snippet.html')
    const events = parsePflEventsListingHtml(html)
    expect(events.some((e) => e.slug === 'pfl-san-diego-2026')).toBe(true)
  })

  it('parses fight card rows', () => {
    const html = FIXTURE('pfl-fightcard-snippet.html')
    const fights = parsePflFightCardHtml(html)
    expect(fights.length).toBe(1)
    expect(fights[0].red.slug).toBe('aj-mckee')
    expect(fights[0].blue.slug).toBe('salamat-isbulaev')
  })
})

describe('KSW events parser', () => {
  it('parses upcoming listing', () => {
    const html = FIXTURE('ksw-events-snippet.html')
    const events = parseKswEventsListingHtml(html)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].numericId).toBeGreaterThan(0)
  })
})

describe('ARES events parser', () => {
  it('parses competition listings', () => {
    const html = FIXTURE('ares-events-snippet.html')
    const events = parseAresEventsListingHtml(html)
    expect(events.some((e) => e.competitionId === 3297)).toBe(true)
  })

  it('parses fighter lines', () => {
    const html = FIXTURE('ares-fightcard-snippet.html')
    const fights = parseAresFightCardHtml(html)
    expect(fights.length).toBeGreaterThan(0)
    expect(fights[0].red.fullName.length).toBeGreaterThan(2)
  })
})
