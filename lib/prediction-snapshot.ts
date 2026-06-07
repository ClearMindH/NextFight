import type { Fight, PredictionSnapshot } from '@/types'
import { getPredictedWinner } from '@/lib/prediction-verdict'

/**
 * Fige le pronostic courant d'un combat (vainqueur, probabilité, confiance).
 * Indispensable pour un bilan honnête : les pronostics sont recalculés à
 * chaque resync du roster et dériveraient sinon.
 */
export function buildPredictionSnapshot(
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner'>,
  capturedAt: string = new Date().toISOString(),
): PredictionSnapshot {
  const winner = getPredictedWinner(fight)
  return {
    predictedWinnerId: winner.id,
    redWinProbability: fight.model.redWinProbability,
    confidence: fight.model.confidence,
    capturedAt,
  }
}
