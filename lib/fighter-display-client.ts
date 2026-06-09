import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import { resolveDisplayRecord } from '@/lib/fighter-record'
import { resolveFighterCountry } from '@/lib/fighter-country-overrides'
import type { Fighter } from '@/types'

/** Mise à jour affichage côté client (sans lecture du roster sur disque). */
export function applyFighterDisplayPatch(
  fighter: Fighter,
  patch?: Partial<Pick<Fighter, 'ranking' | 'imageUrl' | 'record' | 'nickname'>>,
): Fighter {
  const merged = patch ? { ...fighter, ...patch } : fighter
  return mergeSeedRanking({
    ...merged,
    country: resolveFighterCountry(merged) ?? merged.country,
    record: resolveDisplayRecord(merged),
  })
}
