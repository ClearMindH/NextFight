/** Classement affichable dans la division (top 15 officiel). */
export const TOP_RANKED_LIMIT = 15

export function isTopRankedInDivision(
  ranking: number | undefined | null,
): ranking is number {
  return (
    typeof ranking === 'number' &&
    Number.isFinite(ranking) &&
    ranking >= 1 &&
    ranking <= TOP_RANKED_LIMIT
  )
}

/** Libellé badge portrait : classement officiel division → « #N » (champion via `isChampion`). */
export function getDivisionRankingBadge(
  ranking: number | undefined | null,
  isChampion = false,
): string | null {
  if (isChampion) return 'C'
  if (!isTopRankedInDivision(ranking)) return null
  return `#${ranking}`
}
