import { getFighterFromStore } from '@/lib/roster-store'
import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import type { Fighter } from '@/types'

function isPlaceholderRecord(record: string): boolean {
  return record === '0-0-0' || record === '0-0'
}

function pickRecord(card: string, roster: string | undefined): string {
  if (!roster || isPlaceholderRecord(roster)) return card
  if (isPlaceholderRecord(card)) return roster
  return roster
}

/** Fusionne le roster à jour (classement, photo) pour l’affichage des portraits. */
export function mergeFighterForDisplay(fighter: Fighter): Fighter {
  const fresh = getFighterFromStore(fighter.id)
  const merged = fresh
    ? {
        ...fighter,
        ranking: fresh.ranking ?? fighter.ranking,
        imageUrl: fresh.imageUrl ?? fighter.imageUrl,
        nickname: fresh.nickname || fighter.nickname,
        record: pickRecord(fighter.record, fresh.record),
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
        stats:
          fighter.source === 'event-card' && fresh.source !== 'event-card'
            ? fresh.stats
            : { ...fresh.stats, ...fighter.stats },
      }
    : fighter

  return mergeSeedRanking(merged)
}
