import type { Fighter } from '@/types'
import { enrichFighterStatsForPrediction } from '@/lib/prediction/infer-stats-from-record'
import { getRecentBoutsForPrediction } from '@/services/prediction/recent-form'

function inferWinStreakFromRecent(bouts: ReturnType<typeof getRecentBoutsForPrediction>): number {
  let streak = 0
  for (const bout of bouts) {
    if (bout.result === 'win') streak += 1
    else break
  }
  return streak
}

/** Prépare un combattant pour la prédiction (toutes organisations). */
export function prepareFighterForPrediction(fighter: Fighter): Fighter {
  const withStats = enrichFighterStatsForPrediction(fighter)
  const recentBouts = getRecentBoutsForPrediction(withStats)
  if (recentBouts.length === 0) return withStats

  const streak = inferWinStreakFromRecent(recentBouts)
  const stats =
    streak > 0 && (withStats.stats.winStreak ?? 0) === 0
      ? { ...withStats.stats, winStreak: streak }
      : withStats.stats

  return { ...withStats, stats, recentBouts }
}
