import type { Fighter } from '@/types'
import { enrichFighterStatsForPrediction } from '@/lib/prediction/infer-stats-from-record'
import { getRecentBoutsForPrediction } from '@/services/prediction/recent-form'

/** Prépare un combattant pour la prédiction (toutes organisations). */
export function prepareFighterForPrediction(fighter: Fighter): Fighter {
  const withStats = enrichFighterStatsForPrediction(fighter)
  const recentBouts = getRecentBoutsForPrediction(withStats)
  if (recentBouts.length === 0) return withStats
  return { ...withStats, recentBouts }
}
