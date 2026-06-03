import type { FighterRecentBout } from '@/types/recent-form'
import { MAX_RECENT_BOUTS } from '@/types/recent-form'

/** Évite les doublons après syncs répétées (même adversaire / résultat / date). */
export function dedupeRecentBouts(bouts: FighterRecentBout[]): FighterRecentBout[] {
  const seen = new Set<string>()
  const out: FighterRecentBout[] = []
  for (const b of bouts) {
    const key = [
      b.opponentName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      b.result,
      b.method,
      b.monthsAgo,
      b.round ?? '',
    ].join('|')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(b)
  }
  return out.slice(0, MAX_RECENT_BOUTS)
}
