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

/** Libellé badge portrait : champion (#1) → « C », sinon « #N ». */
export function getDivisionRankingBadge(
  ranking: number | undefined | null,
): string | null {
  if (!isTopRankedInDivision(ranking)) return null
  return ranking === 1 ? 'C' : `#${ranking}`
}
