import { describe, expect, it } from 'vitest'
import type { Fighter } from '@/types'
import {
  buildFormProfile,
  computeFormMatchup,
  getRecentBoutsForPrediction,
  recentFormWinProbabilityShift,
} from '@/services/prediction/recent-form'
import { PredictionEngine } from '@/services/PredictionEngine'
import { getFighterFromStore } from '@/lib/roster-store'

function mockFighter(overrides: Partial<Fighter> = {}): Fighter {
  return {
    id: 'ufc-test-1',
    organizationId: 'ufc',
    name: 'Test Fighter',
    record: '12-3-0',
    wins: 12,
    losses: 3,
    draws: 0,
    country: 'USA',
    stats: {
      strikingAccuracy: 55,
      strikeDefense: 54,
      takedownAccuracy: 42,
      takedownDefense: 45,
      reachCm: 185,
      heightCm: 183,
      age: 29,
      winStreak: 2,
      finishingRate: 55,
    },
    lastSyncedAt: '2026-01-01',
    source: 'roster-seed',
    ...overrides,
  }
}

describe('recent-form', () => {
  it('returns no synthetic bouts when history is missing', () => {
    const f = mockFighter({ id: 'ufc-alpha' })
    expect(getRecentBoutsForPrediction(f)).toEqual([])
    const profile = buildFormProfile(f)
    expect(profile.bouts).toHaveLength(0)
    expect(profile.recentFormScore).toBe(0.5)
    expect(profile.strengths).toEqual([])
  })

  it('scores only on available bouts (e.g. 3 fights)', () => {
    const f = mockFighter({
      recentBouts: [
        { opponentName: 'A', result: 'win', method: 'ko_tko', opponentTier: 70, monthsAgo: 1 },
        { opponentName: 'B', result: 'win', method: 'decision', opponentTier: 65, monthsAgo: 2 },
        { opponentName: 'C', result: 'loss', method: 'decision', opponentTier: 60, monthsAgo: 3 },
      ],
    })
    const profile = buildFormProfile(f)
    expect(profile.bouts).toHaveLength(3)
    expect(profile.winsLast5).toBe(2)
    expect(profile.lossesLast5).toBe(1)
    expect(profile.recentFormScore).toBeGreaterThan(0.5)
    expect(profile.recentFormScore).toBeLessThan(1)
  })

  it('builds strengths and weaknesses from bout pattern', () => {
    const f = mockFighter({
      recentBouts: [
        { opponentName: 'A', result: 'win', method: 'ko_tko', opponentTier: 70, monthsAgo: 1 },
        { opponentName: 'B', result: 'win', method: 'ko_tko', opponentTier: 72, monthsAgo: 2 },
        { opponentName: 'C', result: 'win', method: 'decision', opponentTier: 65, monthsAgo: 3 },
        { opponentName: 'D', result: 'loss', method: 'ko_tko', opponentTier: 60, monthsAgo: 4 },
        { opponentName: 'E', result: 'win', method: 'submission', opponentTier: 68, monthsAgo: 5 },
      ],
    })
    const profile = buildFormProfile(f)
    expect(profile.winsLast5).toBe(4)
    expect(profile.strengths.some((s) => s.includes('KO') || s.includes('victoires'))).toBe(true)
  })

  it('computes matchup edge when strength meets weakness', () => {
    const formA = buildFormProfile(
      mockFighter({
        id: 'a',
        recentBouts: [
          { opponentName: 'X', result: 'win', method: 'ko_tko', opponentTier: 80, monthsAgo: 1 },
          { opponentName: 'Y', result: 'win', method: 'ko_tko', opponentTier: 75, monthsAgo: 2 },
          { opponentName: 'Z', result: 'win', method: 'ko_tko', opponentTier: 78, monthsAgo: 3 },
          { opponentName: 'W', result: 'win', method: 'decision', opponentTier: 70, monthsAgo: 4 },
          { opponentName: 'V', result: 'win', method: 'decision', opponentTier: 72, monthsAgo: 5 },
        ],
      }),
    )
    const formB = buildFormProfile(
      mockFighter({
        id: 'b',
        recentBouts: [
          { opponentName: 'X', result: 'loss', method: 'ko_tko', opponentTier: 60, monthsAgo: 1 },
          { opponentName: 'Y', result: 'loss', method: 'ko_tko', opponentTier: 55, monthsAgo: 2 },
          { opponentName: 'Z', result: 'loss', method: 'submission', opponentTier: 58, monthsAgo: 3 },
          { opponentName: 'W', result: 'loss', method: 'decision', opponentTier: 50, monthsAgo: 4 },
          { opponentName: 'V', result: 'loss', method: 'ko_tko', opponentTier: 52, monthsAgo: 5 },
        ],
      }),
    )
    const matchup = computeFormMatchup(formA, formB)
    expect(matchup.matchupEdge).toBeGreaterThan(0)
    expect(matchup.duelKeys.length).toBeGreaterThan(0)
  })

  it('ignores bouts older than 24 months', () => {
    const f = mockFighter({
      recentBouts: [
        { opponentName: 'A', result: 'win', method: 'decision', opponentTier: 70, monthsAgo: 8 },
        { opponentName: 'B', result: 'win', method: 'decision', opponentTier: 65, monthsAgo: 29 },
      ],
    })
    const bouts = getRecentBoutsForPrediction(f)
    expect(bouts).toHaveLength(1)
    expect(bouts[0].opponentName).toBe('A')
  })

  it('neutralizes form edge when one fighter has no recent bouts', () => {
    const formA = buildFormProfile(
      mockFighter({
        recentBouts: [
          { opponentName: 'X', result: 'win', method: 'decision', opponentTier: 70, monthsAgo: 1 },
        ],
      }),
    )
    const formB = buildFormProfile(mockFighter({ id: 'empty' }))
    const matchup = computeFormMatchup(formA, formB)
    expect(matchup.matchupEdge).toBe(0)
  })
})

describe('Ziam vs Nolan recent-form weighting', () => {
  it('favors ranked streaking fighter over unranked opponent with weaker schedule', () => {
    const ziam = getFighterFromStore('ufc-fares-ziam')
    const nolan = getFighterFromStore('ufc-tom-nolan')
    if (!ziam || !nolan) return

    const result = PredictionEngine.predict({
      fighterA: ziam,
      fighterB: nolan,
      scheduledRounds: 3,
    })

    expect(result.fighterAProbability).toBeGreaterThan(result.fighterBProbability)
    expect(result.predictedWinnerId).toBe('ufc-fares-ziam')
    expect(result.breakdown.form?.fighterA.winsLast5).toBe(3)
    expect(result.breakdown.form?.fighterB.bouts.length).toBeLessThanOrEqual(2)
  })
})

describe('PredictionEngine with recent form', () => {
  it('includes recentForm in breakdown without inventing bouts', () => {
    const a = mockFighter({ id: 'red', stats: { winStreak: 3, finishingRate: 70 } })
    const b = mockFighter({ id: 'blue', stats: { winStreak: 0, finishingRate: 30 } })
    const result = PredictionEngine.predict({ fighterA: a, fighterB: b })
    expect(result.breakdown.fighterA.recentForm).toBeDefined()
    expect(result.breakdown.form?.fighterA.bouts).toHaveLength(0)
    expect(getRecentBoutsForPrediction(a)).toHaveLength(0)
  })

  it('uses provided recent bouts as-is', () => {
    const bouts = [
      { opponentName: 'A', result: 'win' as const, method: 'decision' as const, opponentTier: 60, monthsAgo: 1 },
      { opponentName: 'B', result: 'loss' as const, method: 'decision' as const, opponentTier: 55, monthsAgo: 2 },
    ]
    const a = mockFighter({ id: 'red', recentBouts: bouts })
    const result = PredictionEngine.predict({ fighterA: a, fighterB: mockFighter({ id: 'blue' }) })
    expect(result.breakdown.form?.fighterA.bouts).toHaveLength(2)
  })
})
