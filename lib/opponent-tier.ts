import { getAllFightersFromStore } from '@/lib/roster-store'
import { isTopRankedInDivision } from '@/lib/fighter-ranking'
import type { Fighter } from '@/types'

function normalizeFighterName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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
  const wins = hit.wins ?? 0
  const losses = hit.losses ?? 0
  const draws = hit.draws ?? 0
  const total = wins + losses + draws

  const winRate = total > 0 ? wins / total : 0.5
  // Expérience : ~25 combats → 1.
  const experience = Math.min(1, Math.log10(total + 1) / Math.log10(26))

  let score = 30 + winRate * 30 + experience * 12

  const finishing = hit.stats?.finishingRate
  if (finishing != null) {
    score += ((clamp(finishing, 0, 100) - 40) / 100) * 6
  }

  const streak = hit.stats?.winStreak ?? 0
  score += Math.min(6, streak * 1.2)

  if (isTopRankedInDivision(hit.ranking)) {
    // #1 ≈ 94, #15 ≈ 68 ; le palmarès ne peut que rehausser un classé.
    const ranked = 94 - (hit.ranking - 1) * (26 / 14)
    score = Math.max(score, ranked)
  }

  return Math.round(clamp(score, 20, 99))
}

/** Qualité estimée de l'adversaire (0–100) à partir du roster. */
export function resolveOpponentTier(
  opponentName: string,
  athleteWeightClass?: string,
): number {
  const norm = normalizeFighterName(opponentName)
  const roster = getAllFightersFromStore()

  const exact = roster.find((f) => normalizeFighterName(f.name) === norm)
  if (exact) return tierFromFighter(exact)

  const lastName = opponentName.trim().split(/\s+/).pop()?.toLowerCase() ?? ''
  const lastNorm = lastName.replace(/[^a-z0-9]/g, '')
  if (!lastNorm) return 50

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

  return 50
}
