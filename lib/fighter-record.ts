import type { Fighter } from '@/types'

export function isPlaceholderRecord(record: string | undefined): boolean {
  if (!record) return true
  return record === '0-0-0' || record === '0-0'
}

/** Bilan affiché : évite le faux « 0-0-0 » quand le roster a des stats mais pas le record. */
export function resolveDisplayRecord(fighter: Fighter): string {
  const wins = fighter.wins ?? 0
  const losses = fighter.losses ?? 0
  const draws = fighter.draws ?? 0
  const total = wins + losses + draws

  if (total > 0) {
    return `${wins}-${losses}-${draws}`
  }

  if (!isPlaceholderRecord(fighter.record)) {
    return fighter.record
  }

  if ((fighter.recentBouts?.length ?? 0) > 0 || fighter.ranking != null) {
    return '—'
  }

  return fighter.record
}
