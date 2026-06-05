import { getAllFightersFromStore } from '@/lib/roster-store'
import type { Fighter } from '@/types'

function normalizeFighterName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function tierFromFighter(hit: Fighter): number {
  if (hit.ranking && hit.ranking <= 15) return 90 - (hit.ranking - 1) * 4
  const total = (hit.wins ?? 0) + (hit.losses ?? 0)
  if (total >= 10) return 58
  return 55
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
