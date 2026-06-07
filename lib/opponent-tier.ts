import { getAllFightersFromStore } from '@/lib/roster-store'
import { isTopRankedInDivision } from '@/lib/fighter-ranking'
import type { Fighter } from '@/types'

function normalizeFighterName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export interface RecordTierInput {
  wins: number
  losses: number
  draws?: number
  /** Taux de finish 0–100 (optionnel). */
  finishingRate?: number
  /** Série de victoires (optionnel). */
  winStreak?: number
}

/**
 * Qualité (0–100) déduite du seul palmarès : taux de victoire + expérience,
 * affinée par le taux de finish et la série. Socle commun roster ↔ source externe.
 */
export function tierFromRecord(input: RecordTierInput): number {
  const wins = input.wins ?? 0
  const losses = input.losses ?? 0
  const draws = input.draws ?? 0
  const total = wins + losses + draws

  const winRate = total > 0 ? wins / total : 0.5
  // Expérience : ~25 combats → 1.
  const experience = Math.min(1, Math.log10(total + 1) / Math.log10(26))

  let score = 30 + winRate * 30 + experience * 12

  if (input.finishingRate != null) {
    score += ((clamp(input.finishingRate, 0, 100) - 40) / 100) * 6
  }

  const streak = input.winStreak ?? 0
  score += Math.min(6, streak * 1.2)

  return clamp(score, 20, 99)
}

/**
 * Qualité d'un combattant (0–100) à partir des données réelles du roster :
 * palmarès (taux de victoire + expérience), classement et signaux de forme.
 *
 * - Non classés : socle ≈ 30–72 selon le palmarès.
 * - Classés (#1–#15) : bande élite monotone (#1 ≈ 94 … #15 ≈ 68), toujours
 *   au-dessus d'un journalier non classé.
 */
export function tierFromFighter(hit: Fighter): number {
  let score = tierFromRecord({
    wins: hit.wins ?? 0,
    losses: hit.losses ?? 0,
    draws: hit.draws ?? 0,
    finishingRate: hit.stats?.finishingRate,
    winStreak: hit.stats?.winStreak,
  })

  if (isTopRankedInDivision(hit.ranking)) {
    // #1 ≈ 94, #15 ≈ 68 ; le palmarès ne peut que rehausser un classé.
    const ranked = 94 - (hit.ranking - 1) * (26 / 14)
    score = Math.max(score, ranked)
  }

  return Math.round(clamp(score, 20, 99))
}

/** Valeur par défaut quand l'adversaire est introuvable dans le roster. */
export const OPPONENT_TIER_FALLBACK = 50

/**
 * Qualité de l'adversaire (0–100) trouvée dans le roster, ou `null` si absent.
 * Permet aux appelants de tenter une source externe en cas d'absence.
 */
export function resolveOpponentTierFromRoster(
  opponentName: string,
  athleteWeightClass?: string,
): number | null {
  const norm = normalizeFighterName(opponentName)
  const roster = getAllFightersFromStore()

  const exact = roster.find((f) => normalizeFighterName(f.name) === norm)
  if (exact) return tierFromFighter(exact)

  const lastName = opponentName.trim().split(/\s+/).pop()?.toLowerCase() ?? ''
  const lastNorm = lastName.replace(/[^a-z0-9]/g, '')
  if (!lastNorm) return null

  const byLastName = roster.filter((f) => {
    const parts = f.name.trim().split(/\s+/)
    const tail = parts[parts.length - 1]?.toLowerCase().replace(/[^a-z0-9]/g, '')
    return tail === lastNorm
  })

  if (byLastName.length === 1) return tierFromFighter(byLastName[0])

  if (byLastName.length > 1 && athleteWeightClass) {
    const wcToken = athleteWeightClass.toLowerCase().split(/[\s(-]/)[0]
    const sameDivision = byLastName.filter((f) =>
      f.weightClass?.toLowerCase().includes(wcToken),
    )
    if (sameDivision.length === 1) return tierFromFighter(sameDivision[0])
    const ranked = sameDivision.find((f) => f.ranking && f.ranking <= 15)
    if (ranked) return tierFromFighter(ranked)
    if (sameDivision[0]) return tierFromFighter(sameDivision[0])
  }

  const rankedPartial = roster.find(
    (f) =>
      normalizeFighterName(f.name).includes(norm) &&
      norm.length >= 5 &&
      f.ranking &&
      f.ranking <= 15,
  )
  if (rankedPartial) return tierFromFighter(rankedPartial)

  return null
}

/** Qualité estimée de l'adversaire (0–100) à partir du roster (défaut si absent). */
export function resolveOpponentTier(
  opponentName: string,
  athleteWeightClass?: string,
): number {
  return resolveOpponentTierFromRoster(opponentName, athleteWeightClass) ?? OPPONENT_TIER_FALLBACK
}
