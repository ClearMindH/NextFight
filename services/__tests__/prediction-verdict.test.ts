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
  it('annonce uniquement le vainqueur, sans méthode', () => {
    const v = buildPredictionVerdict(
      miniFight({ redWinProbability: 43, predictedMethod: 'decision', predictedRound: 5 }),
    )
    expect(v.headline).toBe('Bonfim vainqueur')
    expect(v.probabilityLine).toContain('57')
  })

  it('ne mentionne ni round ni KO/TKO pour une finition', () => {
    const v = buildPredictionVerdict(
      miniFight({
        redWinProbability: 70,
        predictedMethod: 'ko_tko',
        predictedRound: 2,
        scheduledRounds: 3,
      }),
    )
    expect(v.headline).toBe('Muhammad vainqueur')
  })
})
