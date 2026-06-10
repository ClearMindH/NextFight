import { fighterShortName } from '@/lib/prediction-verdict'
import {
  PREDICTION_OVERRIDES,
  UFC_MARKET_ODDS,
  type PredictionOverride,
} from '@/lib/prediction/market-odds'
import type { Fight, Fighter } from '@/types'
import type { FighterScoreProfile } from '@/types/prediction'

export type PredictionAdjustment = {
  note: string
  kind: 'editorial' | 'market'
}

export type MatchupAdvantage = {
  label: 'Avantage matchup'
  leaderName: string
  leaderCorner: 'red' | 'blue'
  edge: number
  detail: string
}

const MIN_MARKET_ADJUSTMENT_DELTA = 6

const BREAKDOWN_DIMS = [
  'striking',
  'grappling',
  'physical',
  'momentum',
  'schedule',
  'recentForm',
] as const satisfies readonly (keyof FighterScoreProfile)[]

const BREAKDOWN_DIM_LABELS: Record<(typeof BREAKDOWN_DIMS)[number], string> = {
  striking: 'frappe',
  grappling: 'grappling',
  physical: 'portée et gabarit',
  momentum: 'dynamique',
  schedule: "niveau d'opposition",
  recentForm: 'forme récente (modèle)',
}

/**
 * Raisons matchup validées manuellement quand l'auto-génération est trop générique.
 * Clé = fightId.
 */
export const MATCHUP_REASON_OVERRIDES: Record<string, string> = {
  'ufc-freedom-250-f2':
    'Mobilité et gestion à distance face au power striking de Pereira.',
  'ufc-freedom-250-f3':
    'Favori marché malgré la forme récente et la défense de Zahabi.',
  'ufc-freedom-250-f7':
    "Grappling et niveau d'opposition compensent la forme récente de Garcia.",
  'hexagone-mma-45-f6':
    'Momentum et capacité à imposer son rythme face au profil de Bahaji.',
}

function favoriteCorner(fight: Pick<Fight, 'model'>): 'red' | 'blue' {
  return fight.model.redWinProbability >= 50 ? 'red' : 'blue'
}

function favoriteFighter(fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner'>): Fighter {
  return favoriteCorner(fight) === 'red' ? fight.redCorner : fight.blueCorner
}

function formatDimList(labels: string[]): string {
  if (labels.length === 0) return 'Profil stylistique favorable dans ce matchup.'
  if (labels.length === 1) return `Avantage sur la ${labels[0]}.`
  if (labels.length === 2) return `Avantage sur la ${labels[0]} et le ${labels[1]}.`
  return `Avantage sur la ${labels.slice(0, -1).join(', ')} et le ${labels[labels.length - 1]}.`
}

function cleanOverrideReason(reason: string): string {
  return reason
    .replace(/^Pick éditorial\s*:\s*/i, '')
    .replace(/^Alignement bookmakers[^:]*:\s*/i, '')
    .trim()
}

function leadingBreakdownLabels(
  fight: Fight,
  corner: 'red' | 'blue',
): string[] {
  const breakdown = fight.model.breakdown
  if (!breakdown) return []

  const fav = corner === 'red' ? breakdown.red : breakdown.blue
  const opp = corner === 'red' ? breakdown.blue : breakdown.red

  return BREAKDOWN_DIMS.filter((dim) => fav[dim] > opp[dim]).map(
    (dim) => BREAKDOWN_DIM_LABELS[dim],
  )
}

function formatAmericanOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`
}

export function buildPredictionAdjustment(
  fightId: string,
  rawRedWinProbability: number,
  finalRedWinProbability: number,
  redCorner: Fighter,
  blueCorner: Fighter,
): PredictionAdjustment | null {
  const override: PredictionOverride | undefined = PREDICTION_OVERRIDES[fightId]
  if (override) {
    return {
      note: `Pronostic ajusté : ${cleanOverrideReason(override.reason)}`,
      kind: 'editorial',
    }
  }

  const market = UFC_MARKET_ODDS[fightId]
  if (!market) return null

  const rawFavCorner: 'red' | 'blue' =
    rawRedWinProbability >= 50 ? 'red' : 'blue'
  const finalFavCorner: 'red' | 'blue' =
    finalRedWinProbability >= 50 ? 'red' : 'blue'
  const delta = Math.abs(rawRedWinProbability - finalRedWinProbability)
  const favoriteFlipped = rawFavCorner !== finalFavCorner

  if (!favoriteFlipped && delta < MIN_MARKET_ADJUSTMENT_DELTA) return null

  const favFighter = finalFavCorner === 'red' ? redCorner : blueCorner
  const odds =
    finalFavCorner === 'red' ? market.redAmerican : market.blueAmerican

  return {
    note: `Pronostic ajusté : aligné sur les cotes marché (${formatAmericanOdds(odds)} ${fighterShortName(favFighter.name)}).`,
    kind: 'market',
  }
}

export function detectFactorVerdictMismatch(
  fight: Fight,
  factorCorners: Array<'red' | 'blue'>,
): boolean {
  if (factorCorners.length === 0) return false

  const favCorner = favoriteCorner(fight)
  const favWins = factorCorners.filter((corner) => corner === favCorner).length
  const oppWins = factorCorners.length - favWins
  return favWins < oppWins
}

function buildMatchupDetail(fight: Fight, favCorner: 'red' | 'blue'): string {
  const curated = MATCHUP_REASON_OVERRIDES[fight.id]
  if (curated) return curated

  const override = PREDICTION_OVERRIDES[fight.id]
  if (override?.winnerCorner === favCorner) {
    return cleanOverrideReason(override.reason)
  }

  return formatDimList(leadingBreakdownLabels(fight, favCorner))
}

export function buildMatchupAdvantage(
  fight: Fight,
  statFactorCorners: Array<'red' | 'blue'>,
): MatchupAdvantage | null {
  if (!detectFactorVerdictMismatch(fight, statFactorCorners)) return null

  const favCorner = favoriteCorner(fight)
  const fav = favoriteFighter(fight)
  const favWins = statFactorCorners.filter((corner) => corner === favCorner).length
  const oppWins = statFactorCorners.length - favWins

  return {
    label: 'Avantage matchup',
    leaderName: fighterShortName(fav.name),
    leaderCorner: favCorner,
    edge: Math.max(5, oppWins - favWins + 4),
    detail: buildMatchupDetail(fight, favCorner),
  }
}
