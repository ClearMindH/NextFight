import { tierFromRecord } from '@/lib/opponent-tier'
import {
  loadOpponentRecordCache,
  saveOpponentRecordCache,
  normalizeKey,
  type OpponentRecordCache,
  type OpponentRecordEntry,
} from '@/lib/opponent-record-cache'
import {
  fetchExternalMethodCounts,
  type ExternalMethodCounts,
} from '@/lib/mappers/external-fight-records'

/** Tier (0–100) déduit d'un palmarès externe (Sherdog/Tapology). */
export function tierFromExternalCounts(counts: ExternalMethodCounts): number {
  const finishWins = counts.koWins + counts.subWins
  const finishingRate = counts.wins > 0 ? (finishWins / counts.wins) * 100 : undefined
  return Math.round(
    tierFromRecord({
      wins: counts.wins,
      losses: counts.losses,
      finishingRate,
    }),
  )
}

/**
 * Résout le tier d'un adversaire absent du roster via une source externe,
 * avec cache persistant (les échecs sont mémorisés en `null` pour éviter de
 * re-scraper). Asynchrone : à n'utiliser qu'hors requête (scripts de sync).
 */
export async function resolveExternalOpponentTier(
  opponentName: string,
  cache: OpponentRecordCache = loadOpponentRecordCache(),
): Promise<number | null> {
  const key = normalizeKey(opponentName)
  if (!key) return null

  const cached = cache[key]
  if (cached) return cached.tier

  const counts = await fetchExternalMethodCounts(opponentName)
  const entry: OpponentRecordEntry =
    counts && counts.wins + counts.losses > 0
      ? {
          tier: tierFromExternalCounts(counts),
          wins: counts.wins,
          losses: counts.losses,
          source: counts.source,
          fetchedAt: new Date().toISOString(),
        }
      : { tier: null, fetchedAt: new Date().toISOString() }

  cache[key] = entry
  return entry.tier
}

export { loadOpponentRecordCache, saveOpponentRecordCache }
