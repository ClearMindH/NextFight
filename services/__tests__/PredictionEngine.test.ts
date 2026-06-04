import { describe, expect, it } from 'vitest'
import type { Fighter } from '@/types'
import { PredictionEngine } from '@/services/PredictionEngine'
import {
  estimateFinishingRate,
  estimateStrengthOfSchedule,
  extractFeatures,
} from '@/services/prediction/features'

function mockFighter(overrides: Partial<Fighter> & { stats?: Partial<Fighter['stats']> }): Fighter {
  const base: Fighter = {
    id: 'test-fighter',
    organizationId: 'ufc',
    name: 'Test Fighter',
    record: '10-2-0',
    wins: 10,
    losses: 2,
    draws: 0,
    country: 'USA',
    stats: {
      strikingAccuracy: 50,
      strikeDefense: 52,
      takedownAccuracy: 40,
      takedownDefense: 42,
      reachCm: 180,
      heightCm: 178,
      age: 30,
      winStreak: 2,
    },
    lastSyncedAt: '2026-01-01T00:00:00Z',
    source: 'roster-seed',
  }

  return {
    ...base,
    ...overrides,
    stats: { ...base.stats, ...overrides.stats },
  }
}

describe('PredictionEngine', () => {
  it('returns valid probabilities when age is missing (ARES roster)', () => {
    const a = mockFighter({
      id: 'ares-a',
      organizationId: 'ares',
      source: 'merged',
      stats: { age: undefined, strikingAccuracy: 50, takedownAccuracy: 38 },
    })
    const b = mockFighter({
      id: 'ares-b',
      organizationId: 'ares',
      source: 'merged',
      wins: 3,
      losses: 2,
      record: '3-2-0',
      stats: { age: undefined, strikingAccuracy: 50, takedownAccuracy: 38 },
    })

    const result = PredictionEngine.predict({ fighterA: a, fighterB: b })

    expect(Number.isFinite(result.fighterAProbability)).toBe(true)
    expect(Number.isFinite(result.fighterBProbability)).toBe(true)
    expect(result.fighterAProbability + result.fighterBProbability).toBe(100)
    expect(Number.isFinite(result.confidence)).toBe(true)
  })

  it('returns probabilities that sum to 100', () => {
    const a = mockFighter({ id: 'a', stats: { strikingAccuracy: 58, strikeDefense: 60, winStreak: 4 } })
    const b = mockFighter({ id: 'b', stats: { strikingAccuracy: 44, strikeDefense: 48, winStreak: 0 } })

    const result = PredictionEngine.predict({ fighterA: a, fighterB: b })

    expect(result.fighterAProbability + result.fighterBProbability).toBe(100)
    expect(result.fighterAProbability).toBeGreaterThan(result.fighterBProbability)
    expect(result.predictedWinnerId).toBe('a')
  })

  it('clamps probabilities between 8 and 92', () => {
    const dominant = mockFighter({
      id: 'dom',
      ranking: 1,
      stats: {
        strikingAccuracy: 65,
        strikeDefense: 62,
        takedownAccuracy: 55,
        takedownDefense: 60,
        winStreak: 6,
        finishingRate: 80,
        strengthOfSchedule: 90,
        age: 28,
      },
    })
    const weak = mockFighter({
      id: 'weak',
      stats: {
        strikingAccuracy: 40,
        strikeDefense: 40,
        takedownAccuracy: 25,
        takedownDefense: 30,
        winStreak: 0,
        finishingRate: 20,
        strengthOfSchedule: 30,
        age: 38,
      },
    })

    const result = PredictionEngine.predict({ fighterA: dominant, fighterB: weak })

    expect(result.fighterAProbability).toBeLessThanOrEqual(92)
    expect(result.fighterAProbability).toBeGreaterThanOrEqual(8)
  })

  it('respects scheduled rounds for decision picks', () => {
    const a = mockFighter({ id: 'a' })
    const b = mockFighter({ id: 'b' })

    const three = PredictionEngine.predict({ fighterA: a, fighterB: b, scheduledRounds: 3 })
    const five = PredictionEngine.predict({ fighterA: a, fighterB: b, scheduledRounds: 5 })

    expect(three.predictedRound).toBeLessThanOrEqual(3)
    expect(five.predictedRound).toBeLessThanOrEqual(5)
    expect(three.confidence).toBeGreaterThanOrEqual(54)
    expect(three.confidence).toBeLessThanOrEqual(92)
  })

  it('maps to fight model with breakdown', () => {
    const a = mockFighter({ id: 'red' })
    const b = mockFighter({ id: 'blue' })
    const result = PredictionEngine.predict({ fighterA: a, fighterB: b })
    const model = PredictionEngine.toFightModel(result)

    expect(model.redWinProbability).toBe(result.fighterAProbability)
    expect(model.breakdown?.red.compositeScore).toBe(result.breakdown.fighterA.compositeScore)
    expect(model.breakdown?.blue.striking).toBeGreaterThanOrEqual(0)
  })
})

describe('prediction features', () => {
  it('estimates finishing rate in valid range', () => {
    const fighter = mockFighter({ wins: 15, losses: 1, stats: { subAvg: 1.2, slpm: 5.5 } })
    const rate = estimateFinishingRate(fighter)
    expect(rate).toBeGreaterThanOrEqual(15)
    expect(rate).toBeLessThanOrEqual(85)
  })

  it('uses explicit strength of schedule when provided', () => {
    const fighter = mockFighter({ stats: { strengthOfSchedule: 72 } })
    expect(extractFeatures(fighter).strengthOfSchedule).toBe(72)
  })

  it('boosts schedule score for ranked fighters', () => {
    const ranked = mockFighter({ ranking: 3 })
    const unranked = mockFighter({ ranking: undefined })
    expect(estimateStrengthOfSchedule(ranked)).toBeGreaterThan(
      estimateStrengthOfSchedule(unranked),
    )
  })
})
