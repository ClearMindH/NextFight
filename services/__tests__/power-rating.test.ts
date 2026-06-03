import { describe, expect, it } from 'vitest'
import {
  blendedWinProbabilities,
  computePowerRating,
  winProbabilityFromRatings,
} from '@/services/prediction/power-rating'
import type { Fighter } from '@/types'

function mockFighter(overrides: Partial<Fighter> = {}): Fighter {
  return {
    id: 'ufc-a',
    organizationId: 'ufc',
    name: 'Fighter A',
    record: '20-5-0',
    wins: 20,
    losses: 5,
    draws: 0,
    country: 'USA',
    weightClass: 'Welterweight',
    ranking: 3,
    stats: {
      strikingAccuracy: 58,
      strikeDefense: 60,
      takedownAccuracy: 45,
      takedownDefense: 70,
      reachCm: 190,
      heightCm: 180,
      age: 28,
      winStreak: 3,
      finishingRate: 55,
      strengthOfSchedule: 70,
      slpm: 5.2,
      sapm: 3.1,
    },
    ...overrides,
  }
}

describe('power-rating', () => {
  it('rates ranked winners above unranked', () => {
    const ranked = mockFighter({ ranking: 2 })
    const unranked = mockFighter({ id: 'ufc-b', ranking: undefined, wins: 12, losses: 8 })
    expect(computePowerRating(ranked)).toBeGreaterThan(computePowerRating(unranked))
  })

  it('produces valid blended probabilities', () => {
    const a = mockFighter()
    const b = mockFighter({
      id: 'ufc-b',
      name: 'Fighter B',
      wins: 10,
      losses: 10,
      ranking: 10,
      stats: { ...a.stats, winStreak: 0, strikingAccuracy: 48 },
    })
    const blended = blendedWinProbabilities(a, b, 55)
    expect(blended.probA + blended.probB).toBe(100)
    expect(blended.probA).toBeGreaterThanOrEqual(9)
    expect(blended.probA).toBeLessThanOrEqual(91)
  })

  it('winProbabilityFromRatings favors higher rating', () => {
    const { probA } = winProbabilityFromRatings(1600, 1400)
    expect(probA).toBeGreaterThan(55)
  })
})
