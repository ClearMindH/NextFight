import { isPlaceholderStats } from '@/lib/prediction/data-quality'
import type { Fighter, FighterStats } from '@/types'

/** Sources roster officielles (toutes organisations). */
const TRUSTED_ROSTER_SOURCES = new Set([
  'merged',
  'ufc-api',
  'ufc.com',
  'ufc-api+seed',
  'roster-seed',
  'pflmma.com',
  'kswmma.com',
  'aresfighting.com',
  'hexagonemma.fr',
])

export function isTrustedRosterSource(fighter: Fighter): boolean {
  if (fighter.source === 'event-card') return false
  return TRUSTED_ROSTER_SOURCES.has(fighter.source)
}

/**
 * Estime des stats à partir du bilan quand les données sont des placeholders
 * (cartes PFL/KSW/ARES/Hexagone, stubs event-card, etc.).
 */
export function inferStatsFromRecord(fighter: Fighter): FighterStats {
  const s = fighter.stats
  const wins = fighter.wins ?? 0
  const losses = fighter.losses ?? 0
  const total = wins + losses + (fighter.draws ?? 0)
  const winRate = total > 0 ? wins / total : 0.5
  const experience = Math.min(1, total / 24)

  const strikingAccuracy = Math.round(46 + winRate * 14 + experience * 4)
  const strikeDefense = Math.round(48 + winRate * 12 + (fighter.ranking != null ? 4 : 0))
  const takedownAccuracy = Math.round(34 + winRate * 10 + experience * 3)
  const takedownDefense = Math.round(50 + winRate * 10)
  const finishingRate = Math.round(22 + winRate * 38 + Math.min(12, wins * 0.4))
  const strengthOfSchedule = Math.round(
    40 +
      experience * 22 +
      (fighter.ranking != null ? Math.max(0, 16 - fighter.ranking) * 2.5 : 0),
  )

  return {
    ...s,
    strikingAccuracy: isDefaultStat(s.strikingAccuracy, 50)
      ? strikingAccuracy
      : s.strikingAccuracy,
    strikeDefense: isDefaultStat(s.strikeDefense, 55, 52)
      ? strikeDefense
      : (s.strikeDefense ?? strikeDefense),
    takedownAccuracy: isDefaultStat(s.takedownAccuracy, 40)
      ? takedownAccuracy
      : s.takedownAccuracy,
    takedownDefense: isDefaultStat(s.takedownDefense, 55, 65)
      ? takedownDefense
      : (s.takedownDefense ?? takedownDefense),
    finishingRate: s.finishingRate ?? finishingRate,
    strengthOfSchedule: s.strengthOfSchedule ?? strengthOfSchedule,
    winStreak: s.winStreak ?? 0,
  }
}

function isDefaultStat(
  value: number | undefined,
  primary: number,
  alt?: number,
): boolean {
  if (value == null) return true
  return value === primary || (alt != null && value === alt)
}

/** Applique l’inférence uniquement si les stats ne sont pas déjà fiables. */
export function enrichFighterStatsForPrediction(fighter: Fighter): Fighter {
  if (!isPlaceholderStats(fighter) && !isEventCardLikeStub(fighter)) {
    return fighter
  }

  const hasRecord = (fighter.wins ?? 0) + (fighter.losses ?? 0) > 0
  if (!hasRecord && fighter.source === 'event-card') {
    return fighter
  }

  return {
    ...fighter,
    stats: inferStatsFromRecord(fighter),
    source: fighter.source === 'event-card' ? 'merged' : fighter.source,
  }
}

function isEventCardLikeStub(fighter: Fighter): boolean {
  return fighter.source === 'event-card' && fighter.record === '0-0-0'
}
