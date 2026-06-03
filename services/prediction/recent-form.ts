import { dedupeRecentBouts } from '@/lib/recent-bouts'
import type { FightMethod, Fighter } from '@/types'
import type {
  FighterFormProfile,
  FighterRecentBout,
  FormMatchupInsight,
} from '@/types/recent-form'
import { MAX_RECENT_BOUTS } from '@/types/recent-form'
import { normalizeFeature } from './features'

export { MAX_RECENT_BOUTS }

/** Combats récents réellement connus (0 à 5), sans synthèse. */
export function getRecentBoutsForPrediction(fighter: Fighter): FighterRecentBout[] {
  if (!fighter.recentBouts?.length) return []
  return dedupeRecentBouts(fighter.recentBouts)
}

/** @deprecated Utiliser getRecentBoutsForPrediction */
export function ensureRecentBouts(fighter: Fighter): FighterRecentBout[] {
  return getRecentBoutsForPrediction(fighter)
}

function countMethodWins(bouts: FighterRecentBout[], method: FightMethod): number {
  return bouts.filter((b) => b.result === 'win' && b.method === method).length
}

function countMethodLosses(bouts: FighterRecentBout[], method: FightMethod): number {
  return bouts.filter((b) => b.result === 'loss' && b.method === method).length
}

function buildFormSignals(bouts: FighterRecentBout[]): Pick<
  FighterFormProfile,
  'winsLast5' | 'lossesLast5' | 'finishRateLast5' | 'strengths' | 'weaknesses'
> {
  const n = bouts.length
  const winsLast5 = bouts.filter((b) => b.result === 'win').length
  const lossesLast5 = bouts.filter((b) => b.result === 'loss').length
  const winBouts = bouts.filter((b) => b.result === 'win')
  const finishWins = winBouts.filter((b) => b.method === 'ko_tko' || b.method === 'submission').length
  const finishRateLast5 = winBouts.length ? (finishWins / winBouts.length) * 100 : 0
  const avgOppTier = bouts.reduce((s, b) => s + b.opponentTier, 0) / n

  const koWins = countMethodWins(bouts, 'ko_tko')
  const subWins = countMethodWins(bouts, 'submission')
  const decWins = countMethodWins(bouts, 'decision')
  const koLosses = countMethodLosses(bouts, 'ko_tko')
  const subLosses = countMethodLosses(bouts, 'submission')

  const strengths: string[] = []
  const weaknesses: string[] = []

  if (winsLast5 >= Math.min(n, 4) && winsLast5 / n >= 0.8) {
    strengths.push(`Série de victoires (${winsLast5}/${n})`)
  } else if (winsLast5 >= Math.ceil(n * 0.6) && n >= 2) {
    strengths.push(`Forme ascendante (${winsLast5}/${n} victoires)`)
  }

  if (koWins >= 2) strengths.push('Puissance striking (KO/TKO récents)')
  if (subWins >= 2) strengths.push('Menace soumission')
  if (decWins >= Math.ceil(n * 0.6) && lossesLast5 <= 1) {
    strengths.push('Contrôle & cardio (décisions)')
  }
  if (finishRateLast5 >= 60 && winBouts.length >= 2) strengths.push('Taux de finish élevé')
  if (avgOppTier >= 65) strengths.push('Adversaires de niveau élevé')

  if (lossesLast5 >= Math.ceil(n * 0.6) && n >= 2) {
    weaknesses.push(`Passe difficile (${lossesLast5}/${n} défaites)`)
  }
  if (koLosses >= 2) weaknesses.push('Chin / vulnérabilité KO')
  if (subLosses >= 2) weaknesses.push('Défense soumission à surveiller')
  if (winsLast5 <= 1 && lossesLast5 >= 2 && n >= 3) weaknesses.push('Momentum négatif')
  if (finishRateLast5 < 25 && decWins < 2 && n >= 3) {
    weaknesses.push('Peu de menace de finish')
  }

  return { winsLast5, lossesLast5, finishRateLast5, strengths, weaknesses }
}

export function buildFormProfile(fighter: Fighter): FighterFormProfile {
  const bouts = getRecentBoutsForPrediction(fighter)
  const n = bouts.length

  if (n === 0) {
    return {
      recentFormScore: 0.5,
      winsLast5: 0,
      lossesLast5: 0,
      finishRateLast5: 0,
      strengths: [],
      weaknesses: [],
      bouts: [],
    }
  }

  const { winsLast5, lossesLast5, finishRateLast5, strengths, weaknesses } =
    buildFormSignals(bouts)

  const avgOppTier = bouts.reduce((s, b) => s + b.opponentTier, 0) / n
  const winScore = normalizeFeature(winsLast5, 0, n)
  const tierScore = normalizeFeature(avgOppTier, 25, 90)
  const finishScore = normalizeFeature(finishRateLast5, 0, 80)
  const lossPenalty = normalizeFeature(lossesLast5, 0, n)
  const depth = n / MAX_RECENT_BOUTS

  const rawScore = Math.min(
    1,
    Math.max(
      0,
      winScore * 0.45 +
        tierScore * 0.25 +
        finishScore * 0.2 -
        lossPenalty * 0.15 +
        (fighter.stats.winStreak ?? 0) * 0.03,
    ),
  )

  const recentFormScore = 0.5 + (rawScore - 0.5) * depth

  return {
    recentFormScore,
    winsLast5,
    lossesLast5,
    finishRateLast5,
    strengths,
    weaknesses,
    bouts,
  }
}

const STRENGTH_WEAKNESS_PAIRS: [string, string][] = [
  ['Puissance striking (KO/TKO récents)', 'Chin / vulnérabilité KO'],
  ['Menace soumission', 'Défense soumission à surveiller'],
  ['Taux de finish élevé', 'Peu de menace de finish'],
  ['Série de victoires', 'Momentum négatif'],
  ['Forme ascendante', 'Passe difficile'],
  ['Contrôle & cardio (décisions)', 'Peu de menace de finish'],
]

function pairMatches(strength: string, label: string): boolean {
  return strength.includes(label) || label.includes(strength.split('(')[0].trim())
}

export function computeFormMatchup(
  formA: FighterFormProfile,
  formB: FighterFormProfile,
): FormMatchupInsight {
  const depthA = formA.bouts.length / MAX_RECENT_BOUTS
  const depthB = formB.bouts.length / MAX_RECENT_BOUTS
  const depth = Math.min(depthA, depthB)

  let edge = (formA.recentFormScore - formB.recentFormScore) * 0.5 * depth
  const duelKeys: string[] = []

  if (depth > 0) {
    for (const [strengthKey, weaknessKey] of STRENGTH_WEAKNESS_PAIRS) {
      const aExploitsB = formA.strengths.some(
        (s) => pairMatches(s, strengthKey) && formB.weaknesses.some((w) => pairMatches(w, weaknessKey)),
      )
      const bExploitsA = formB.strengths.some(
        (s) => pairMatches(s, strengthKey) && formA.weaknesses.some((w) => pairMatches(w, weaknessKey)),
      )
      if (aExploitsB) {
        edge += 0.06 * depth
        duelKeys.push(`${strengthKey} → expose ${weaknessKey} (coin rouge)`)
      }
      if (bExploitsA) {
        edge -= 0.06 * depth
        duelKeys.push(`${strengthKey} → expose ${weaknessKey} (coin bleu)`)
      }
    }
  }

  edge = Math.max(-0.2, Math.min(0.2, edge))

  return {
    fighterA: formA,
    fighterB: formB,
    matchupEdge: edge,
    duelKeys: duelKeys.slice(0, 4),
  }
}
