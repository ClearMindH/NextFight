import { describe, expect, it } from 'vitest'
import type { Fighter } from '@/types'
import {
  buildFighterMethodProfile,
  pickPredictedMethod,
  scoreMethodScenarios,
} from '@/services/prediction/method-profile'

function mockFighter(partial: Partial<Fighter> & { stats?: Partial<Fighter['stats']> }): Fighter {
  const baseStats: Fighter['stats'] = {
    strikingAccuracy: 55,
    takedownAccuracy: 40,
    takedownDefense: 50,
    reachCm: 180,
    heightCm: 178,
    age: 28,
    winStreak: 2,
    finishingRate: 70,
    slpm: 5.2,
    subAvg: 0.3,
  }
  return {
    id: 'f1',
    organizationId: 'ufc',
    name: 'Test',
    record: '10-2-0',
    wins: 10,
    losses: 2,
    draws: 0,
    country: 'FR',
    lastSyncedAt: '2026-01-01',
    source: 'merged',
    ...partial,
    stats: { ...baseStats, ...partial.stats },
  }
}

describe('method-profile', () => {
  it('uses recent bout methods when available', () => {
    const f = mockFighter({
      wins: 12,
      losses: 3,
      recentBouts: [
        { opponentName: 'A', result: 'win', method: 'ko_tko', opponentTier: 60, monthsAgo: 2 },
        { opponentName: 'B', result: 'win', method: 'ko_tko', opponentTier: 60, monthsAgo: 4 },
        { opponentName: 'C', result: 'loss', method: 'ko_tko', opponentTier: 60, monthsAgo: 6 },
      ],
    })
    const profile = buildFighterMethodProfile(f)
    expect(profile.winKoPct).toBeGreaterThan(profile.winSubPct)
    expect(profile.lossKoPct).toBeGreaterThan(0)
  })

  it('favors KO when striker finishes and opponent chin is weak', () => {
    const favored = buildFighterMethodProfile(
      mockFighter({
        wins: 15,
        recentBouts: [
          { opponentName: 'X', result: 'win', method: 'ko_tko', opponentTier: 70, monthsAgo: 3 },
          { opponentName: 'Y', result: 'win', method: 'ko_tko', opponentTier: 70, monthsAgo: 5 },
        ],
      }),
    )
    const underdog = buildFighterMethodProfile(
      mockFighter({
        wins: 8,
        losses: 5,
        recentBouts: [
          { opponentName: 'Z', result: 'loss', method: 'ko_tko', opponentTier: 60, monthsAgo: 2 },
          { opponentName: 'W', result: 'loss', method: 'ko_tko', opponentTier: 60, monthsAgo: 4 },
        ],
      }),
    )
    const scores = scoreMethodScenarios(favored, underdog, {
      absDelta: 0.12,
      strikingEdge: 0.15,
      grapplingEdge: 0,
      avgFinishingRate: 62,
    })
    expect(pickPredictedMethod(scores)).toBe('ko_tko')
    expect(scores.ko).toBeGreaterThan(scores.decision)
  })

  it('favors submission for grappler vs weak sub defense', () => {
    const favored = buildFighterMethodProfile(
      mockFighter({
        stats: { subAvg: 1.8, finishingRate: 65 },
        recentBouts: [
          { opponentName: 'A', result: 'win', method: 'submission', opponentTier: 65, monthsAgo: 3 },
          { opponentName: 'B', result: 'win', method: 'submission', opponentTier: 65, monthsAgo: 6 },
        ],
      }),
    )
    const underdog = buildFighterMethodProfile(
      mockFighter({
        recentBouts: [
          { opponentName: 'C', result: 'loss', method: 'submission', opponentTier: 55, monthsAgo: 4 },
        ],
      }),
    )
    const scores = scoreMethodScenarios(favored, underdog, {
      absDelta: 0.1,
      strikingEdge: 0,
      grapplingEdge: 0.14,
      avgFinishingRate: 58,
    })
    expect(pickPredictedMethod(scores)).toBe('submission')
  })
})
