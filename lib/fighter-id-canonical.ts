import { slugifyId } from '@/lib/mappers/ufc-api'

/** Slugs erronés renvoyés par UFC.com → slug athlete correct. */
const UFC_ATHLETE_SLUG_ALIASES: Record<string, string> = {
  'etomen-shiyahashian': 'edmen-shahbazyan',
}

const UFC_FIGHTER_ID_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(UFC_ATHLETE_SLUG_ALIASES).map(([bad, good]) => [
    `ufc-${bad}`,
    `ufc-${good}`,
  ]),
)

export function normalizeUfcAthleteSlug(
  slug: string | undefined,
  fullName: string,
): string | undefined {
  if (!slug) return slugifyId(fullName) || undefined
  const bare = slug.replace(/^ufc-/, '')
  const aliased = UFC_ATHLETE_SLUG_ALIASES[bare] ?? bare
  const nameSlug = slugifyId(fullName)
  if (nameSlug) {
    // Compare en alphanumérique pur : « sean-omalley » (slug officiel) et
    // « sean-o-malley » (dérivé de « O'Malley ») désignent la même personne.
    // On ne retombe sur le nom que si le slug vise vraiment quelqu'un d'autre.
    const slugAlnum = aliased.replace(/-/g, '')
    const nameAlnum = nameSlug.replace(/-/g, '')
    if (slugAlnum !== nameAlnum) return nameSlug
  }
  return aliased
}

export function slugMatchesFighterName(slug: string, fullName: string): boolean {
  const bare = slug.replace(/^ufc-/, '')
  const normalized = UFC_ATHLETE_SLUG_ALIASES[bare] ?? bare
  return normalized === slugifyId(fullName)
}

/** ID roster canonique (corrige les IDs créés à partir de slugs UFC erronés). */
export function canonicalizeFighterId(id: string): string {
  return UFC_FIGHTER_ID_ALIASES[id] ?? id
}
