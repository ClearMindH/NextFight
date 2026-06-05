import type { Fighter } from '@/types'
import { fetchExternalMethodCounts } from '@/lib/mappers/external-fight-records'

/** Enrichit un combattant avec les stats méthodes Sherdog / Tapology. */
export async function enrichFighterExternalMethods(
  fighter: Fighter,
): Promise<Fighter> {
  if (fighter.externalMethodCounts && fighter.externalMethodCounts.wins > 0) {
    return fighter
  }

  const sparse =
    (fighter.wins ?? 0) + (fighter.losses ?? 0) < 5 ||
    fighter.record === '0-0-0'

  if (!sparse && (fighter.recentBouts?.length ?? 0) >= 3) {
    return fighter
  }

  const external = await fetchExternalMethodCounts(fighter.name)
  if (!external) return fighter

  return {
    ...fighter,
    externalMethodCounts: {
      koWins: external.koWins,
      subWins: external.subWins,
      decWins: external.decWins,
      koLosses: external.koLosses,
      subLosses: external.subLosses,
      decLosses: external.decLosses,
      wins: external.wins,
      losses: external.losses,
      source: external.source,
    },
    wins: Math.max(fighter.wins ?? 0, external.wins),
    losses: Math.max(fighter.losses ?? 0, external.losses),
  }
}
