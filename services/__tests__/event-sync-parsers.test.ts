import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
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
