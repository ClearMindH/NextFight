import type { Fighter } from '@/types'
import { isTrustedRosterSource } from '@/lib/prediction/infer-stats-from-record'

/** Empreinte des stats par défaut (stubs carte / mappers génériques). */
const DEFAULT_STAT_FINGERPRINT = {
  strikingAccuracy: 50,
  takedownAccuracy: 40,
  strikeDefense: 55,
  takedownDefense: 55,
} as const

export function isEventCardStub(fighter: Fighter): boolean {
  return fighter.source === 'event-card'
}

export function isPlaceholderStats(fighter: Fighter): boolean {
  const s = fighter.stats
  if (isEventCardStub(fighter)) return true
  if (fighter.record === '0-0-0' && (fighter.wins ?? 0) === 0) return true

  const matchesDefault =
    s.strikingAccuracy === DEFAULT_STAT_FINGERPRINT.strikingAccuracy &&
    s.takedownAccuracy === DEFAULT_STAT_FINGERPRINT.takedownAccuracy &&
    (s.strikeDefense === DEFAULT_STAT_FINGERPRINT.strikeDefense ||
      s.strikeDefense === 52) &&
    (s.takedownDefense === DEFAULT_STAT_FINGERPRINT.takedownDefense ||
      s.takedownDefense === 65)

  const noFightMetrics =
    s.slpm == null && s.sapm == null && s.tdAvg == null && s.subAvg == null

  return matchesDefault && noFightMetrics
}

/** Score 0–1 : richesse des données pour calibrer la confiance et le blend. */
export function getDataQualityScore(fighter: Fighter): number {
  if (isEventCardStub(fighter)) return 0.15
  if (isPlaceholderStats(fighter)) return 0.35

  let score = 0.45
  const s = fighter.stats
  if (s.slpm != null) score += 0.12
  if (s.sapm != null) score += 0.06
  if (s.tdAvg != null) score += 0.08
  if (s.subAvg != null) score += 0.06
  if (fighter.ranking != null && fighter.ranking <= 15) score += 0.1
  if ((fighter.recentBouts?.length ?? 0) > 0) score += 0.15
  if (isTrustedRosterSource(fighter)) score += 0.05

  const totalFights = (fighter.wins ?? 0) + (fighter.losses ?? 0)
  if (totalFights >= 10) score += 0.05

  return Math.min(1, score)
}
