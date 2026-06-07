import { getAllFightersFromStore, getFighterFromStore } from '@/lib/roster-store'
import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import { isPlaceholderRecord, resolveDisplayRecord } from '@/lib/fighter-record'
import { hasFighterPortrait } from '@/lib/fighter-portrait'
import type { Fighter } from '@/types'

function normalizeFighterName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function resolveCrossOrgImageUrl(fighter: Fighter): string | undefined {
  if (hasFighterPortrait(fighter)) return fighter.imageUrl
  const target = normalizeFighterName(fighter.name)
  if (!target) return undefined

  const match = getAllFightersFromStore().find(
    (candidate) =>
      candidate.id !== fighter.id &&
      normalizeFighterName(candidate.name) === target &&
      hasFighterPortrait(candidate),
  )
  return match?.imageUrl
}

function pickRecord(card: string, roster: Fighter | undefined): string {
  if (!roster) return card
  const resolved = resolveDisplayRecord(roster)
  if (!isPlaceholderRecord(card)) return card
  if (!isPlaceholderRecord(resolved)) return resolved
  return resolved
}

/** Fusionne le roster à jour (classement, photo) pour l’affichage des portraits. */
export function mergeFighterForDisplay(fighter: Fighter): Fighter {
  const fresh = getFighterFromStore(fighter.id)
  const merged = fresh
    ? {
        ...fighter,
        ranking: fresh.ranking ?? fighter.ranking,
        imageUrl:
          fresh.imageUrl ??
          fighter.imageUrl ??
          resolveCrossOrgImageUrl(fresh) ??
          resolveCrossOrgImageUrl(fighter),
        nickname: fresh.nickname || fighter.nickname,
        record: pickRecord(fighter.record, fresh),
        wins:
          fresh.wins + fresh.losses + fresh.draws > 0
            ? fresh.wins
            : fighter.wins,
        losses:
          fresh.wins + fresh.losses + fresh.draws > 0
            ? fresh.losses
            : fighter.losses,
        draws:
          fresh.wins + fresh.losses + fresh.draws > 0
            ? fresh.draws
            : fighter.draws,
        weightClass: fighter.weightClass || fresh.weightClass,
        externalMethodCounts:
          fresh.externalMethodCounts ?? fighter.externalMethodCounts,
        recentBouts:
          (fresh.recentBouts?.length ?? 0) > 0
            ? fresh.recentBouts
            : fighter.recentBouts,
        stats:
          fighter.source === 'event-card' && fresh.source !== 'event-card'
            ? fresh.stats
            : { ...fresh.stats, ...fighter.stats },
      }
    : {
        ...fighter,
        imageUrl: fighter.imageUrl ?? resolveCrossOrgImageUrl(fighter),
      }

  return mergeSeedRanking(merged)
}
