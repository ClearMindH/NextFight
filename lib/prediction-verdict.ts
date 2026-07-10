import type { Fight, Fighter } from '@/types'

const FIGHTER_NICKNAME_BY_NORMALIZED_NAME: Record<string, string> = {
  'benoit saint denis': 'BSD',
}

function normalizeFighterName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function fighterShortName(name: string): string {
  const normalized = normalizeFighterName(name)
  const nickname = FIGHTER_NICKNAME_BY_NORMALIZED_NAME[normalized]
  if (nickname) return nickname

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  if (parts.length >= 3 && /^(i{1,3}|iv|v|vi{0,3}|ix|x|jr\.?|sr\.?)$/i.test(parts[parts.length - 1]!)) {
    return parts[parts.length - 2]!
  }
  return parts.length > 1 ? parts[parts.length - 1]! : parts[0]!
}

export function getPredictedWinner(
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner'>,
): Fighter {
  return fight.model.redWinProbability >= 50 ? fight.redCorner : fight.blueCorner
}

export interface PredictionVerdictText {
  /** Ex. « Bonfim vainqueur » */
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

  const headline = `${name} vainqueur`

  return {
    headline,
    probabilityLine: options?.includeProbability !== false
      ? `${Math.round(winnerProb)} % de probabilité`
      : undefined,
    winner,
    winnerProbability: winnerProb,
  }
}
