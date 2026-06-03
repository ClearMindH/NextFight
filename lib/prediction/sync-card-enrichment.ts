import { enrichUfcFighterFromOfficialSite } from '@/lib/mappers/ufc-athlete-enrichment'
import { enrichFighterStatsForPrediction } from '@/lib/prediction/infer-stats-from-record'
import { upsertFighterInStore } from '@/lib/roster-store'
import type { Fighter, OrganizationId } from '@/types'

export type CardEnrichmentResult =
  | { status: 'enriched'; fighter: Fighter; detail: string }
  | { status: 'skipped'; reason: string }

/**
 * Enrichissement carte → roster pour les probabilités (toutes orgs).
 * UFC : scrape officiel ; autres : inférence bilan + stats roster existantes.
 */
export async function enrichCardFighter(
  orgId: OrganizationId,
  fighter: Fighter,
): Promise<CardEnrichmentResult> {
  if (orgId === 'ufc') {
    const next = await enrichUfcFighterFromOfficialSite(fighter)
    upsertFighterInStore(next)
    const bouts = next.recentBouts?.length ?? 0
    return {
      status: 'enriched',
      fighter: next,
      detail: `UFC.com (recent: ${bouts}, source: ${next.source})`,
    }
  }

  const next = enrichFighterStatsForPrediction(fighter)
  const statsChanged =
    next.stats.strikingAccuracy !== fighter.stats.strikingAccuracy ||
    next.stats.finishingRate !== fighter.stats.finishingRate ||
    next.stats.strengthOfSchedule !== fighter.stats.strengthOfSchedule

  if (!statsChanged && next.source === fighter.source) {
    return { status: 'skipped', reason: 'already has reliable stats' }
  }

  upsertFighterInStore({
    ...next,
    lastSyncedAt: new Date().toISOString(),
    source: next.source === 'event-card' ? 'merged' : next.source,
  })

  return {
    status: 'enriched',
    fighter: next,
    detail: `${orgId} roster inference (record ${next.record})`,
  }
}
