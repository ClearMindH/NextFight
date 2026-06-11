import type { PredictionEngineResult } from '@/types/prediction'

/** Cotes américaines (moneyline) pour un coin rouge / bleu. */
export interface MarketOddsEntry {
  redAmerican: number
  blueAmerican: number
  /** Source indicative (ex. FanDuel, consensus juin 2026). */
  source: string
}

/** Override éditorial : force le vainqueur et une probabilité plancher. */
export interface PredictionOverride {
  winnerCorner: 'red' | 'blue'
  winnerProbability: number
  reason: string
}

/**
 * Cotes UFC Freedom 250 — consensus bookmakers (juin 2026).
 * Sources : FanDuel, Yahoo Sports, Fight Sports, Covers.
 */
export const UFC_MARKET_ODDS: Record<string, MarketOddsEntry> = {
  'ufc-freedom-250-f1': { redAmerican: -1000, blueAmerican: 525, source: 'consensus' },
  'ufc-freedom-250-f2': { redAmerican: -120, blueAmerican: -110, source: 'consensus' },
  'ufc-freedom-250-f3': { redAmerican: -500, blueAmerican: 325, source: 'consensus' },
  'ufc-freedom-250-f4': { redAmerican: -330, blueAmerican: 265, source: 'ufc.com' },
  'ufc-freedom-250-f5': { redAmerican: -650, blueAmerican: 400, source: 'consensus' },
  'ufc-freedom-250-f6': { redAmerican: -375, blueAmerican: 260, source: 'consensus' },
  'ufc-freedom-250-f7': { redAmerican: -185, blueAmerican: 155, source: 'ufc.com' },
}

/** Overrides validés manuellement (prioritaires sur le modèle statistique). */
export const PREDICTION_OVERRIDES: Record<string, PredictionOverride> = {
  'ufc-freedom-250-f2': {
    winnerCorner: 'blue',
    winnerProbability: 52,
    reason:
      'Notre lecture : Gane gagne sur la mobilité et la gestion à distance — Pereira doit toucher pour imposer son power, plus difficile sur 5 rounds.',
  },
  'ufc-freedom-250-f3': {
    winnerCorner: 'red',
    winnerProbability: 78,
    reason:
      "Notre lecture : O'Malley garde l'avantage en boxe, reach et gestion de distance malgré la forme récente de Zahabi.",
  },
}

/** Poids du marché dans le blend final (45 % marché / 55 % modèle). */
export const MARKET_BLEND_WEIGHT = 0.45

/** Probabilité implicite brute à partir d'une cote américaine. */
export function americanToImpliedProbability(odds: number): number {
  if (odds < 0) {
    return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
  }
  return (100 / (odds + 100)) * 100
}

/** Retire la marge bookmaker sur un marché deux issues. */
export function devigTwoWay(redImpl: number, blueImpl: number): { red: number; blue: number } {
  const total = redImpl + blueImpl
  if (total <= 0) return { red: 50, blue: 50 }
  const red = Math.round((redImpl / total) * 1000) / 10
  return { red, blue: Math.round((100 - red) * 10) / 10 }
}

export function fairMarketProbability(entry: MarketOddsEntry): { red: number; blue: number } {
  const redImpl = americanToImpliedProbability(entry.redAmerican)
  const blueImpl = americanToImpliedProbability(entry.blueAmerican)
  return devigTwoWay(redImpl, blueImpl)
}

export function blendModelWithMarket(
  modelProbA: number,
  marketProbA: number,
  weight = MARKET_BLEND_WEIGHT,
): number {
  const blended = Math.round(modelProbA * (1 - weight) + marketProbA * weight)
  return Math.min(91, Math.max(9, blended))
}

/**
 * Applique le blend marché + overrides éventuels sur un résultat moteur.
 * fighterA = coin rouge.
 */
export function applyMarketOdds(
  result: PredictionEngineResult,
  fightId: string,
  fighterAId: string,
  fighterBId: string,
): PredictionEngineResult {
  const override = PREDICTION_OVERRIDES[fightId]
  const market = UFC_MARKET_ODDS[fightId]

  if (!override && !market) return result

  let probA = result.fighterAProbability

  if (market) {
    const fair = fairMarketProbability(market)
    probA = blendModelWithMarket(probA, fair.red)
  }

  if (override) {
    const overrideProb =
      override.winnerCorner === 'red' ? override.winnerProbability : 100 - override.winnerProbability
    probA = overrideProb
  }

  const probB = 100 - probA
  const predictedWinnerId = probA >= probB ? fighterAId : fighterBId

  const fair = market ? fairMarketProbability(market) : null
  const marketAligned =
    fair &&
    ((fair.red >= 50 && probA >= 50) || (fair.red < 50 && probA < 50))

  let confidence = result.confidence
  if (override || marketAligned) {
    confidence = Math.min(95, Math.max(confidence, Math.round(Math.abs(probA - 50) + 12)))
  } else if (market) {
    confidence = Math.max(45, confidence - 8)
  }

  return {
    ...result,
    fighterAProbability: probA,
    fighterBProbability: probB,
    predictedWinnerId,
    confidence,
  }
}
