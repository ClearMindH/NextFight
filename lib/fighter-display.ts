import { getFighterFromStore } from '@/lib/roster-store'
import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import type { Fighter } from '@/types'

/** Fusionne le roster à jour (classement, photo) pour l’affichage des portraits. */
export function mergeFighterForDisplay(fighter: Fighter): Fighter {
  const fresh = getFighterFromStore(fighter.id)
  const merged = fresh
    ? {
        ...fighter,
        ranking: fresh.ranking ?? fighter.ranking,
        imageUrl: fresh.imageUrl ?? fighter.imageUrl,
        nickname: fighter.nickname ?? fresh.nickname,
        record: fighter.record !== '0-0-0' ? fighter.record : fresh.record,
        stats:
          fighter.source === 'event-card' && fresh.source !== 'event-card'
            ? fresh.stats
            : { ...fresh.stats, ...fighter.stats },
      }
    : fighter

  return mergeSeedRanking(merged)
}
