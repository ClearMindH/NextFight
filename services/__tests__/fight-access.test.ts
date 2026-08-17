import { describe, expect, it } from 'vitest'
import type { Event, Fight } from '@/types'
import { getFightDetailHref } from '@/lib/fight-access'

function mockFight(id: string, order: number, isMainEvent = false): Fight {
  return {
    id,
    eventId: 'ev-1',
    order,
    weightClass: 'Lightweight',
    isTitle: false,
    isMainEvent,
    scheduledRounds: 3,
    redId: 'r1',
    blueId: 'b1',
    redCorner: {
      id: 'r1',
      organizationId: 'ufc',
      name: 'Red',
      record: '10-0',
      wins: 10,
      losses: 0,
      draws: 0,
      country: 'FR',
      stats: {},
      lastSyncedAt: '',
      source: 'merged',
    },
    blueCorner: {
      id: 'b1',
      organizationId: 'ufc',
      name: 'Blue',
      record: '8-2',
      wins: 8,
      losses: 2,
      draws: 0,
      country: 'US',
      stats: {},
      lastSyncedAt: '',
      source: 'merged',
    },
    model: {
      redWinProbability: 55,
      predictedMethod: 'decision',
      predictedRound: 3,
      confidence: 60,
      breakdown: {
        red: { compositeScore: 0.5, striking: 0.5, grappling: 0.5, physical: 0.5, momentum: 0.5, schedule: 0.5, recentForm: 0.5 },
        blue: { compositeScore: 0.5, striking: 0.5, grappling: 0.5, physical: 0.5, momentum: 0.5, schedule: 0.5, recentForm: 0.5 },
      },
    },
  }
}

function mockEvent(fights: Fight[]): Event {
  return {
    id: 'ev-1',
    organizationId: 'ufc',
    name: 'Test Card',
    date: '2026-06-01',
    venue: 'Arena',
    city: 'Paris',
    country: 'France',
    status: 'upcoming',
    predictionsStatus: 'published',
    fights,
  }
}

describe('getFightDetailHref', () => {
  const main = mockFight('main', 1, true)
  const coMain = mockFight('comain', 2)
  const prelim = mockFight('prelim', 5)
  const event = mockEvent([main, coMain, prelim])

  it('opens fight page for premium subscribers', () => {
    expect(getFightDetailHref(main, event, true)).toBe('/fight/main')
    expect(getFightDetailHref(prelim, event, true)).toBe('/fight/prelim')
  })

  it('opens fight page for free co-main only', () => {
    expect(getFightDetailHref(coMain, event, false)).toBe('/fight/comain')
  })

  it('opens fight page for locked fights so the pick teaser is visible', () => {
    expect(getFightDetailHref(main, event, false)).toBe('/fight/main')
    expect(getFightDetailHref(prelim, event, false)).toBe('/fight/prelim')
  })
})
