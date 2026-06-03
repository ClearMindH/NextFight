import { isTopRankedInDivision } from '@/lib/fighter-ranking'
import { slugifyId } from '@/lib/mappers/ufc-api'
import { getFighterFromStore, upsertFighterInStore } from '@/lib/roster-store'
import type { Fighter, OrganizationId } from '@/types'
import { resolveFighterId } from './resolve-fighter'
import type { ScrapedEvent, ScrapedFighterRef } from './types'

const DEFAULT_STATS: Fighter['stats'] = {
  strikingAccuracy: 50,
  strikeDefense: 50,
  takedownAccuracy: 40,
  takedownDefense: 55,
  reachCm: 178,
  heightCm: 175,
  age: 28,
  winStreak: 0,
  finishingRate: 40,
  strengthOfSchedule: 50,
}

/** Ensures athletes on an official fight card exist in the roster (champions often missing from “Actif” list). */
export function ensureCardFightersInRoster(event: ScrapedEvent): void {
  for (const fight of event.fights) {
    for (const corner of [fight.red, fight.blue]) {
      ensureOne(event.organizationId, corner)
    }
  }
}

function applyCardRanking(orgId: OrganizationId, ref: ScrapedFighterRef): void {
  if (!isTopRankedInDivision(ref.ranking)) return

  const id = resolveFighterId(orgId, ref)
  if (!id) return

  const existing = getFighterFromStore(id)
  if (!existing || existing.ranking === ref.ranking) return

  upsertFighterInStore({
    ...existing,
    ranking: ref.ranking,
    lastSyncedAt: new Date().toISOString(),
  })
}

function ensureOne(orgId: OrganizationId, ref: ScrapedFighterRef): void {
  const existingId = resolveFighterId(orgId, ref)
  if (existingId) {
    applyCardRanking(orgId, ref)
    return
  }

  const slug = ref.slug ?? slugifyId(ref.fullName)
  if (!slug || !ref.fullName) return

  const id = `${orgId}-${slug}`
  if (getFighterFromStore(id)) {
    applyCardRanking(orgId, ref)
    return
  }

  const fighter: Fighter = {
    id,
    organizationId: orgId,
    name: ref.fullName,
    record: '0-0-0',
    wins: 0,
    losses: 0,
    draws: 0,
    country: 'Unknown',
    ranking: isTopRankedInDivision(ref.ranking) ? ref.ranking : undefined,
    stats: { ...DEFAULT_STATS },
    lastSyncedAt: new Date().toISOString(),
    source: 'event-card',
  }

  upsertFighterInStore(fighter)
}
