import { describe, expect, it } from 'vitest'
import {
  getCoMainFight,
  getFreePreviewFight,
  getMainFight,
} from '@/lib/event-helpers'
import type { Event, Fight } from '@/types'

function mockFight(
  id: string,
  order: number,
  isMainEvent: boolean,
): Fight {
  return {
    id,
    eventId: 'ev-1',
    order,
    weightClass: 'Welterweight',
    isTitle: false,
    isMainEvent,
    scheduledRounds: 5,
    redId: `r-${id}`,
    blueId: `b-${id}`,
    redCorner: {
      id: `r-${id}`,
      organizationId: 'ufc',
      name: `Red ${order}`,
      record: '10-0',
      wins: 10,
      losses: 0,
      draws: 0,
      country: 'USA',
      stats: {
        strikingAccuracy: 50,
        takedownAccuracy: 40,
        reachCm: 180,
        heightCm: 180,
        age: 30,
        winStreak: 1,
      },
    },
    blueCorner: {
      id: `b-${id}`,
      organizationId: 'ufc',
      name: `Blue ${order}`,
      record: '8-2',
      wins: 8,
      losses: 2,
      draws: 0,
      country: 'USA',
      stats: {
        strikingAccuracy: 50,
        takedownAccuracy: 40,
        reachCm: 180,
        heightCm: 180,
        age: 28,
        winStreak: 0,
      },
    },
    model: {
      redWinProbability: 55,
      predictedMethod: 'decision',
      predictedRound: 3,
      confidence: 60,
      breakdown: {
        red: {
          striking: 50,
          grappling: 50,
          physical: 50,
          momentum: 50,
          schedule: 50,
          recentForm: 50,
          compositeScore: 50,
        },
        blue: {
          striking: 50,
          grappling: 50,
          physical: 50,
          momentum: 50,
          schedule: 50,
          recentForm: 50,
          compositeScore: 50,
        },
      },
    },
  }
}

const event: Event = {
  id: 'ev-1',
  organizationId: 'ufc',
  name: 'Test Card',
  date: '2026-06-07T00:00:00Z',
  venue: 'Arena',
  city: 'Vegas',
  country: 'USA',
  status: 'upcoming',
  communityPredictions: 100,
  fights: [
    mockFight('main', 1, true),
    mockFight('comain', 2, false),
    mockFight('prelim', 5, false),
  ],
}

describe('event-helpers', () => {
  it('returns main event by isMainEvent flag', () => {
    expect(getMainFight(event)?.id).toBe('main')
  })

  it('returns co-main as second fight on card', () => {
    expect(getCoMainFight(event)?.id).toBe('comain')
    expect(getFreePreviewFight(event)?.id).toBe('comain')
  })

  it('falls back to only fight when card has one bout', () => {
    const single: Event = { ...event, fights: [mockFight('solo', 1, true)] }
    expect(getCoMainFight(single)?.id).toBe('solo')
  })
})
