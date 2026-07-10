import { describe, expect, it } from 'vitest'
import {
  enrichFighterStatsForPrediction,
  isTrustedRosterSource,
} from '@/lib/prediction/infer-stats-from-record'
import { getDataQualityScore } from '@/lib/prediction/data-quality'
import { blendedWinProbabilities } from '@/services/prediction/power-rating'
import type { Fighter } from '@/types'

function mockFighter(
  orgId: Fighter['organizationId'],
  overrides: Partial<Fighter> = {},
): Fighter {
  return {
    id: `${orgId}-a`,
    organizationId: orgId,
    name: 'Fighter A',
    record: '15-4-0',
    wins: 15,
    losses: 4,
    draws: 0,
    country: 'France',
    weightClass: 'Welterweight',
    stats: {
      strikingAccuracy: 50,
      takedownAccuracy: 40,
      strikeDefense: 55,
      takedownDefense: 65,
      reachCm: 183,
      heightCm: 180,
      age: 29,
      winStreak: 0,
    },
    source: 'merged',
    ...overrides,
  }
}

const ORGS = ['ufc'] as const

describe('infer-stats-from-record (UFC)', () => {
  it.each(ORGS)('infers non-default stats for %s placeholders', (orgId) => {
    const raw = mockFighter(orgId)
    const enriched = enrichFighterStatsForPrediction(raw)
    expect(enriched.stats.strikingAccuracy).not.toBe(50)
    expect(enriched.stats.finishingRate).toBeGreaterThan(30)
  })

  it.each(ORGS)('trusted merged roster scores data quality for %s', (orgId) => {
    const fighter = mockFighter(orgId)
    expect(isTrustedRosterSource(fighter)).toBe(true)
    const enriched = enrichFighterStatsForPrediction(fighter)
    expect(getDataQualityScore(enriched)).toBeGreaterThanOrEqual(0.4)
  })

  it.each(ORGS)('blended probabilities stay valid for %s', (orgId) => {
    const a = enrichFighterStatsForPrediction(
      mockFighter(orgId, { wins: 18, losses: 2, ranking: 3 }),
    )
    const b = enrichFighterStatsForPrediction(
      mockFighter(orgId, {
        id: `${orgId}-b`,
        wins: 10,
        losses: 10,
        ranking: 9,
      }),
    )
    const blended = blendedWinProbabilities(a, b, 52)
    expect(blended.probA + blended.probB).toBe(100)
    expect(blended.probA).toBeGreaterThan(50)
  })
})
