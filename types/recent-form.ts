import type { FightMethod } from './index'

export type BoutResult = 'win' | 'loss' | 'draw'

export const MAX_RECENT_BOUTS = 5

/** Combats récents enregistrés (jusqu’à 5) pour un combattant */
export interface FighterRecentBout {
  opponentName: string
  result: BoutResult
  method: FightMethod
  round?: number
  /** Qualité estimée de l'adversaire (0–100) */
  opponentTier: number
  /** Mois en arrière (1 = plus récent) */
  monthsAgo: number
}

export interface FighterFormProfile {
  /** Score forme récente normalisé 0–1 */
  recentFormScore: number
  /** Victoires sur la fenêtre récente disponible (≤ 5) */
  winsLast5: number
  lossesLast5: number
  /** Taux de finish en victoire sur la fenêtre */
  finishRateLast5: number
  strengths: string[]
  weaknesses: string[]
  bouts: FighterRecentBout[]
}

export interface FormMatchupInsight {
  fighterA: FighterFormProfile
  fighterB: FighterFormProfile
  /** Avantage forme pour le coin A (−1 à 1, positif = A) */
  matchupEdge: number
  /** Clés du duel issues de forces vs faiblesses */
  duelKeys: string[]
}
