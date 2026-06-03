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

const seedRankingIndex = new Map<string, number>()

function seedKey(orgId: OrganizationId, name: string): string {
  return `${orgId}:${slugifyId(name)}`
}

function buildSeedRankingIndex(): void {
  if (seedRankingIndex.size > 0) return
  for (const orgId of Object.keys(SEEDS_BY_ORG) as OrganizationId[]) {
    for (const seed of SEEDS_BY_ORG[orgId]) {
      if (!isTopRankedInDivision(seed.ranking)) continue
      seedRankingIndex.set(seedKey(orgId, seed.name), seed.ranking!)
    }
  }
}

/** Classement connu depuis les seeds officiels NextFight (top 15 / champion). */
export function getSeedRanking(
  orgId: OrganizationId,
  name: string,
): number | undefined {
  buildSeedRankingIndex()
  return seedRankingIndex.get(seedKey(orgId, name))
}

/** Complète le classement roster si absent ou hors top 15. */
export function mergeSeedRanking(fighter: Fighter): Fighter {
  if (isTopRankedInDivision(fighter.ranking)) return fighter
  const fromSeed = getSeedRanking(fighter.organizationId, fighter.name)
  if (!fromSeed) return fighter
  return { ...fighter, ranking: fromSeed }
}
