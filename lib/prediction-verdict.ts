import type { Fight, FightMethod, Fighter } from '@/types'

export function fighterShortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  return parts.length > 1 ? parts[parts.length - 1]! : parts[0]!
}

/** Phrase naturelle après le nom du vainqueur (ex. « à la décision »). */
export function methodVerdictPhrase(method: FightMethod): string {
  switch (method) {
    case 'ko_tko':
      return 'par KO/TKO'
    case 'submission':
      return 'par soumission'
    case 'decision':
      return 'à la décision'
    case 'draw':
      return 'par match nul'
    default:
      return ''
  }
}

export function getPredictedWinner(
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner'>,
): Fighter {
  return fight.model.redWinProbability >= 50 ? fight.redCorner : fight.blueCorner
}

export interface PredictionVerdictText {
  /** Ex. « Bonfim à la décision » */
  headline: string
  /** Ex. « 57 % de probabilité » */
  probabilityLine?: string
  winner: Fighter
  winnerProbability: number
}

export function buildPredictionVerdict(
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner' | 'scheduledRounds'>,
  options?: { includeProbability?: boolean },
): PredictionVerdictText {
  const winner = getPredictedWinner(fight)
  const winnerProb = Math.max(
    fight.model.redWinProbability,
    100 - fight.model.redWinProbability,
  )
  const name = fighterShortName(winner.name)
  const phrase = methodVerdictPhrase(fight.model.predictedMethod)

  let headline = `${name} ${phrase}`
  if (fight.model.predictedMethod !== 'decision' && fight.model.predictedMethod !== 'draw') {
    headline = `${name} ${phrase} en R${fight.model.predictedRound}`
  }

  return {
    headline,
    probabilityLine: options?.includeProbability !== false
      ? `${Math.round(winnerProb)} % de probabilité`
      : undefined,
    winner,
    winnerProbability: winnerProb,
  }
}
