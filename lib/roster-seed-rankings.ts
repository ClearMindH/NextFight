import {
  aresSeeds,
  hexagoneSeeds,
  kswSeeds,
  pflSeeds,
  ufcSeeds,
  type SeedInput,
} from '@/data/seeds/build-roster'
import { isTopRankedInDivision } from '@/lib/fighter-ranking'
import { slugifyId } from '@/lib/mappers/ufc-api'
import type { Fighter, OrganizationId } from '@/types'

const SEEDS_BY_ORG: Record<OrganizationId, SeedInput[]> = {
  ufc: ufcSeeds,
  pfl: pflSeeds,
  ksw: kswSeeds,
  ares: aresSeeds,
  hexagone: hexagoneSeeds,
}

function seedMatchesName(seed: SeedInput, name: string): boolean {
  return slugifyId(seed.name) === slugifyId(name)
}

/** Classement connu depuis les seeds officiels NextFight (top 15 / champion). */
export function getSeedRanking(
  orgId: OrganizationId,
  name: string,
  weightClass?: string,
): number | undefined {
  const seeds = SEEDS_BY_ORG[orgId] ?? []
  const ranked = seeds.filter(
    (seed) => seedMatchesName(seed, name) && isTopRankedInDivision(seed.ranking),
  )
  if (ranked.length === 0) return undefined

  if (weightClass) {
    const inDivision = ranked.find((seed) => seed.weightClass === weightClass)
    return inDivision?.ranking
  }

  return ranked[0]?.ranking
}

/** Complète le classement roster si absent ou hors top 15. */
export function mergeSeedRanking(fighter: Fighter): Fighter {
  if (isTopRankedInDivision(fighter.ranking)) return fighter
  const fromSeed = getSeedRanking(fighter.organizationId, fighter.name, fighter.weightClass)
  if (!fromSeed) return fighter
  return { ...fighter, ranking: fromSeed }
}
