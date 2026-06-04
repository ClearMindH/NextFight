import { describe, expect, it } from 'vitest'
import { buildPredictionVerdict } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'

function miniFight(overrides: Partial<Fight['model']> & { redName?: string; blueName?: string }): Pick<
  Fight,
  'model' | 'redCorner' | 'blueCorner' | 'scheduledRounds'
> {
  const {
    redWinProbability = 43,
    predictedMethod = 'decision',
    predictedRound = 5,
    scheduledRounds = 5,
    redName = 'Belal Muhammad',
    blueName = 'Gabriel Bonfim',
    confidence = 92,
  } = overrides
  return {
    scheduledRounds,
    redCorner: { name: redName } as Fight['redCorner'],
    blueCorner: { name: blueName } as Fight['blueCorner'],
    model: {
      redWinProbability,
      predictedMethod,
      predictedRound,
      confidence,
    } as Fight['model'],
  }
}

describe('buildPredictionVerdict', () => {
  it('formats decision pick like Bonfim à la décision', () => {
    const v = buildPredictionVerdict(
      miniFight({ redWinProbability: 43, predictedMethod: 'decision', predictedRound: 5 }),
    )
    expect(v.headline).toBe('Bonfim à la décision')
    expect(v.probabilityLine).toContain('57')
  })

  it('includes round for finish', () => {
    const v = buildPredictionVerdict(
      miniFight({
        redWinProbability: 70,
        predictedMethod: 'ko_tko',
        predictedRound: 2,
        scheduledRounds: 3,
      }),
    )
    expect(v.headline).toBe('Muhammad par KO/TKO en R2')
  })
})
