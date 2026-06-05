import { isTopRankedInDivision } from '@/lib/fighter-ranking'
import { getDataQualityScore, isPlaceholderStats } from '@/lib/prediction/data-quality'
import { getRecentBoutsForPrediction } from '@/services/prediction/recent-form'
import type { Fighter } from '@/types'

const BASE_RATING = 1500

/** Rating Elo-like dérivé des données disponibles (pas d’historique combat par combat requis). */
export function computePowerRating(fighter: Fighter): number {
  let rating = BASE_RATING

  const wins = fighter.wins ?? 0
  const losses = fighter.losses ?? 0
  const total = wins + losses
  if (total > 0) {
    const winRate = wins / total
    rating += (winRate - 0.5) * 280
    rating += Math.min(80, Math.log10(total + 1) * 40)
  }

  if (isTopRankedInDivision(fighter.ranking)) {
    rating += (16 - fighter.ranking) * 24
    if (total === 0) rating += 95
  }

  const streak = fighter.stats.winStreak ?? 0
  rating += Math.min(45, streak * 9)

  const recentBouts = getRecentBoutsForPrediction(fighter)
  if (recentBouts.length > 0) {
    const recentWins = recentBouts.filter((b) => b.result === 'win').length
    const recentLosses = recentBouts.filter((b) => b.result === 'loss').length
    const avgOpp =
      recentBouts.reduce((s, b) => s + b.opponentTier, 0) / recentBouts.length
    rating += recentWins * 16
    rating -= recentLosses * 12
    rating += (avgOpp - 50) * 0.85
  }

  if (!isPlaceholderStats(fighter)) {
    const s = fighter.stats
    const strikeEdge =
      (s.strikingAccuracy - 50) * 1.2 + ((s.strikeDefense ?? 50) - 50) * 0.9
    const grapEdge =
      (s.takedownAccuracy - 38) * 1.1 + ((s.takedownDefense ?? 55) - 55) * 0.8
    rating += (strikeEdge + grapEdge) * 0.35
    if (s.slpm != null && s.sapm != null) {
      rating += Math.min(25, (s.slpm - s.sapm) * 4)
    }
  }

  return Math.round(Math.max(1200, Math.min(1850, rating)))
}

export function winProbabilityFromRatings(
  ratingA: number,
  ratingB: number,
  k = 400,
): { probA: number; probB: number } {
  const rawA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / k))
  let probA = Math.round(rawA * 100)
  probA = Math.min(90, Math.max(10, probA))
  return { probA, probB: 100 - probA }
}

export function blendedWinProbabilities(
  fighterA: Fighter,
  fighterB: Fighter,
  heuristicProbA: number,
): { probA: number; probB: number; powerProbA: number; powerRatingA: number; powerRatingB: number } {
  const ratingA = computePowerRating(fighterA)
  const ratingB = computePowerRating(fighterB)
  const { probA: powerProbA } = winProbabilityFromRatings(ratingA, ratingB)

  const quality = (getDataQualityScore(fighterA) + getDataQualityScore(fighterB)) / 2
  const powerWeight = 0.22 + quality * 0.38
  const heuristicWeight = 1 - powerWeight

  let probA = Math.round(heuristicProbA * heuristicWeight + powerProbA * powerWeight)

  if (
    isTopRankedInDivision(fighterA.ranking) &&
    isTopRankedInDivision(fighterB.ranking) &&
    fighterA.weightClass &&
    fighterA.weightClass === fighterB.weightClass
  ) {
    const gap = fighterB.ranking! - fighterA.ranking!
    probA += Math.max(-6, Math.min(6, gap * 1.5))
  }

  probA = Math.min(91, Math.max(9, probA))
  return {
    probA,
    probB: 100 - probA,
    powerProbA,
    powerRatingA: ratingA,
    powerRatingB: ratingB,
  }
}
