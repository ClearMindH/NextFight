import { describe, expect, it } from 'vitest'
import {
  americanToImpliedProbability,
  applyMarketOdds,
  blendModelWithMarket,
  devigTwoWay,
  fairMarketProbability,
  UFC_MARKET_ODDS,
} from '@/lib/prediction/market-odds'
import type { PredictionEngineResult } from '@/types/prediction'

function stubResult(probA: number, redId = 'red', blueId = 'blue'): PredictionEngineResult {
  return {
    fighterAProbability: probA,
    fighterBProbability: 100 - probA,
    confidence: 70,
    predictedMethod: 'decision',
    predictedRound: 3,
    predictedWinnerId: probA >= 50 ? redId : blueId,
    breakdown: {
      fighterA: {
        compositeScore: 0.5,
        striking: 0.5,
        grappling: 0.5,
        physical: 0.5,
        momentum: 0.5,
        schedule: 0.5,
        recentForm: 0.5,
      },
      fighterB: {
        compositeScore: 0.5,
        striking: 0.5,
        grappling: 0.5,
        physical: 0.5,
        momentum: 0.5,
        schedule: 0.5,
        recentForm: 0.5,
      },
      featureDelta: 0,
    },
  }
}

describe('market-odds', () => {
  it('converts American odds to implied probability', () => {
    expect(americanToImpliedProbability(-500)).toBeCloseTo(83.33, 1)
    expect(americanToImpliedProbability(325)).toBeCloseTo(23.53, 1)
  })

  it('devigs two-way market to 100%', () => {
    const { red, blue } = devigTwoWay(83.33, 23.53)
    expect(red + blue).toBeCloseTo(100, 0)
    expect(red).toBeGreaterThan(70)
  })

  it('blends model and market probabilities', () => {
    expect(blendModelWithMarket(30, 78, 0.45)).toBe(52)
  })

  it('forces Gane winner on UFC Freedom 250 f2', () => {
    const result = applyMarketOdds(
      stubResult(54.2, 'ufc-alex-pereira', 'ufc-ciryl-gane'),
      'ufc-freedom-250-f2',
      'ufc-alex-pereira',
      'ufc-ciryl-gane',
    )
    expect(result.predictedWinnerId).toBe('ufc-ciryl-gane')
    expect(result.fighterBProbability).toBe(52)
    expect(result.fighterAProbability).toBe(48)
  })

  it('forces O\'Malley winner on UFC Freedom 250 f3', () => {
    const result = applyMarketOdds(
      stubResult(30.1, 'ufc-sean-omalley', 'ufc-aiemann-zahabi'),
      'ufc-freedom-250-f3',
      'ufc-sean-omalley',
      'ufc-aiemann-zahabi',
    )
    expect(result.predictedWinnerId).toBe('ufc-sean-omalley')
    expect(result.fighterAProbability).toBe(78)
    expect(result.fighterBProbability).toBe(22)
  })

  it('has market odds for every UFC Freedom 250 fight', () => {
    for (let i = 1; i <= 7; i++) {
      expect(UFC_MARKET_ODDS[`ufc-freedom-250-f${i}`]).toBeDefined()
    }
  })

  it('fair market for Topuria vs Gaethje favors Topuria heavily', () => {
    const fair = fairMarketProbability(UFC_MARKET_ODDS['ufc-freedom-250-f1'])
    expect(fair.red).toBeGreaterThan(80)
  })
})
