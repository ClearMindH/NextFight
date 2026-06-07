import { describe, expect, it } from 'vitest'
import { buildAnalysisContext } from '@/services/analysis/build-analysis-context'
import { parseNarrativeJson } from '@/services/analysis/parse-narrative'
import type { Fighter } from '@/types'
import { PredictionEngine } from '@/services/PredictionEngine'

const fighterA: Fighter = {
  id: 'a',
  organizationId: 'ufc',
  name: 'Fighter A',
  record: '20-2',
  wins: 20,
  losses: 2,
  draws: 0,
  country: 'USA',
  stats: {
    strikingAccuracy: 55,
    strikeDefense: 58,
    takedownAccuracy: 45,
    takedownDefense: 50,
    reachCm: 190,
    heightCm: 185,
    age: 29,
    winStreak: 3,
  },
  lastSyncedAt: '2026-01-01',
  source: 'roster-seed',
}

const fighterB: Fighter = {
  ...fighterA,
  id: 'b',
  name: 'Fighter B',
  stats: { ...fighterA.stats, strikingAccuracy: 48, winStreak: 1 },
}

describe('parseNarrativeJson', () => {
  it('parses valid OpenAI JSON payload', () => {
    const raw = JSON.stringify({
      analysis:
        'This is a stylistic clash between a pressure striker and a counter wrestler. Expect early exchanges on the feet before grappling enters late.',
      redCorner: {
        strengths: ['Elite reach', 'Volume striking'],
        weaknesses: ['Takedown defense lapses'],
      },
      blueCorner: {
        strengths: ['Chain wrestling', 'Cardio'],
        weaknesses: ['Slow starts'],
      },
      fightKeys: ['Distance management', 'Cage wrestling', 'Round 1 pace'],
    })

    const result = parseNarrativeJson(raw, 'gpt-4o-mini')
    expect(result.redCorner.strengths).toHaveLength(2)
    expect(result.fightKeys).toHaveLength(3)
    expect(result.providerModel).toBe('gpt-4o-mini')
  })
})

describe('buildAnalysisContext', () => {
  it('embeds statistical model outputs without recomputing', () => {
    const prediction = PredictionEngine.predict({ fighterA, fighterB, scheduledRounds: 5 })
    const ctx = buildAnalysisContext(fighterA, fighterB, prediction, {
      weightClass: 'Welterweight',
    })

    expect(ctx.statisticalModel.fighterAWinPercent).toBe(prediction.fighterAProbability)
    expect(ctx.statisticalModel).not.toHaveProperty('predictedMethod')
    expect(ctx.statisticalModel).not.toHaveProperty('predictedRound')
    expect(ctx.fighterA.name).toBe('Fighter A')
  })
})
