import type { Fighter } from '@/types'
import type { FighterUpsertPayload } from '@/types/admin'
import { slugifyFighterId, upsertFighterInStore } from '@/lib/roster-store'

export function buildFighterFromPayload(payload: FighterUpsertPayload): Fighter {
  const id =
    payload.id?.trim() ||
    slugifyFighterId(payload.organizationId, payload.name)

  const wins = payload.wins
  const losses = payload.losses
  const draws = payload.draws

  return {
    id,
    organizationId: payload.organizationId,
    name: payload.name.trim(),
    nickname: payload.nickname?.trim() || undefined,
    record: payload.record.trim() || `${wins}-${losses}-${draws}`,
    wins,
    losses,
    draws,
    country: payload.country.trim(),
    weightClass: payload.weightClass?.trim() || undefined,
    ranking: payload.ranking,
    imageUrl: payload.imageUrl?.trim() || undefined,
    stats: {
      strikingAccuracy: payload.stats.strikingAccuracy,
      strikeDefense: payload.stats.strikeDefense ?? Math.round(payload.stats.strikingAccuracy * 0.92),
      takedownAccuracy: payload.stats.takedownAccuracy,
      takedownDefense: payload.stats.takedownDefense ?? Math.round(payload.stats.takedownAccuracy * 0.95),
      reachCm: payload.stats.reachCm,
      heightCm: payload.stats.heightCm,
      age: payload.stats.age,
      winStreak: payload.stats.winStreak,
      finishingRate: payload.stats.finishingRate,
      strengthOfSchedule: payload.stats.strengthOfSchedule,
    },
    lastSyncedAt: new Date().toISOString(),
    source: 'roster-seed',
  }
}

export function saveFighter(payload: FighterUpsertPayload): Fighter {
  const fighter = buildFighterFromPayload(payload)
  return upsertFighterInStore(fighter)
}
