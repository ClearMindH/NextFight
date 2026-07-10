/**
 * Source de vérité des rosters NextFight.
 * Régénérer les JSON : npm run sync:fighters
 */
import type { Fighter, OrganizationId, OrganizationRoster } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

export type SeedInput = {
  name: string
  nickname?: string
  record: string
  country: string
  weightClass?: string
  ranking?: number
  stance?: string
  stats: Fighter['stats']
}

const SEED_VERSION = 'nextfight-seed-v2'

function buildFighter(org: OrganizationId, seed: SeedInput): Fighter {
  const parts = seed.record.split('-').map(Number)
  const wins = parts[0] ?? 0
  const losses = parts[1] ?? 0
  const draws = parts[2] ?? 0

  return {
    id: `${org}-${slugifyId(seed.name)}`,
    organizationId: org,
    name: seed.name,
    nickname: seed.nickname,
    record: seed.record,
    wins,
    losses,
    draws,
    country: seed.country,
    weightClass: seed.weightClass,
    ranking: seed.ranking,
    stance: seed.stance,
    stats: seed.stats,
    lastSyncedAt: new Date().toISOString(),
    source: 'roster-seed',
  }
}

function roster(org: OrganizationId, fighters: SeedInput[]): OrganizationRoster {
  const built = fighters.map((f) => buildFighter(org, f))
  return {
    meta: {
      organizationId: org,
      fighterCount: built.length,
      lastSyncedAt: new Date().toISOString(),
      source: SEED_VERSION,
    },
    fighters: built,
  }
}

/** Stats helper: striking %, TD %, reach cm, height cm, age, win streak */
const s = (
  strikingAccuracy: number,
  takedownAccuracy: number,
  reachCm: number,
  heightCm: number,
  age: number,
  winStreak: number,
  extra?: Partial<Fighter['stats']>,
): Fighter['stats'] => ({
  strikingAccuracy,
  strikeDefense:
    extra?.strikeDefense ?? extra?.strDef ?? Math.round(strikingAccuracy * 0.92),
  takedownAccuracy,
  takedownDefense:
    extra?.takedownDefense ?? extra?.tdDef ?? Math.round(takedownAccuracy * 0.95),
  reachCm,
  heightCm,
  age,
  winStreak,
  ...extra,
})

// ─── UFC ───────────────────────────────────────────────────────────────────

export const ufcSeeds: SeedInput[] = [
  // Heavyweight
  { name: 'Jon Jones', nickname: 'Bones', record: '28-1-0', country: 'USA', weightClass: 'Heavyweight', ranking: 1, stance: 'Orthodox', stats: s(57, 45, 215, 193, 37, 4, { slpm: 4.29, tdAvg: 1.82 }) },
  { name: 'Tom Aspinall', record: '15-3-0', country: 'UK', weightClass: 'Heavyweight', ranking: 2, stats: s(61, 42, 198, 196, 32, 3, { slpm: 7.22, tdAvg: 0.89 }) },
  { name: 'Ciryl Gane', record: '13-2-0', country: 'France', weightClass: 'Heavyweight', ranking: 1, stats: s(58, 33, 206, 193, 34, 1) },
  { name: 'Curtis Blaydes', record: '18-4-0', country: 'USA', weightClass: 'Heavyweight', ranking: 4, stats: s(52, 48, 203, 193, 34, 2) },
  { name: 'Sergei Pavlovich', record: '19-3-0', country: 'Russia', weightClass: 'Heavyweight', ranking: 5, stats: s(55, 25, 213, 188, 32, 1) },
  // Light Heavyweight
  { name: 'Alex Pereira', nickname: 'Poatan', record: '12-2-0', country: 'Brazil', weightClass: 'Light Heavyweight', ranking: 1, stats: s(62, 25, 203, 193, 37, 2) },
  { name: 'Magomed Ankalaev', record: '21-1-1', country: 'Russia', weightClass: 'Light Heavyweight', ranking: 2, stats: s(50, 42, 191, 191, 32, 3) },
  { name: 'Jiri Prochazka', record: '31-5-1', country: 'Czech Republic', weightClass: 'Light Heavyweight', ranking: 3, stats: s(56, 28, 203, 193, 32, 0) },
  { name: 'Jamahal Hill', record: '12-2-0', country: 'USA', weightClass: 'Light Heavyweight', ranking: 4, stats: s(55, 30, 205, 193, 33, 1) },
  { name: 'Carlos Ulberg', record: '12-1-0', country: 'New Zealand', weightClass: 'Light Heavyweight', ranking: 5, stats: s(54, 35, 193, 188, 33, 4) },
  // Middleweight
  { name: 'Dricus du Plessis', nickname: 'Stillknocks', record: '22-2-0', country: 'South Africa', weightClass: 'Middleweight', ranking: 1, stats: s(54, 48, 183, 185, 31, 5) },
  { name: 'Sean Strickland', record: '29-6-0', country: 'USA', weightClass: 'Middleweight', ranking: 2, stats: s(53, 35, 193, 185, 33, 1) },
  { name: 'Khamzat Chimaev', record: '14-0-0', country: 'Sweden', weightClass: 'Middleweight', ranking: 3, stats: s(58, 55, 190, 188, 31, 4) },
  { name: 'Israel Adesanya', record: '24-4-0', country: 'New Zealand', weightClass: 'Middleweight', ranking: 4, stats: s(50, 15, 203, 193, 35, 0) },
  { name: 'Robert Whittaker', record: '26-8-0', country: 'Australia', weightClass: 'Middleweight', ranking: 5, stats: s(49, 42, 185, 183, 34, 1) },
  // Welterweight
  { name: 'Belal Muhammad', nickname: 'Remember the Name', record: '24-3-0', country: 'USA', weightClass: 'Welterweight', ranking: 1, stats: s(49, 44, 183, 178, 36, 3) },
  { name: 'Shavkat Rakhmonov', record: '19-0-0', country: 'Kazakhstan', weightClass: 'Welterweight', ranking: 2, stats: s(56, 50, 196, 183, 30, 5) },
  { name: 'Jack Della Maddalena', record: '18-2-0', country: 'Australia', weightClass: 'Welterweight', ranking: 3, stats: s(54, 40, 185, 183, 28, 4) },
  { name: 'Gilbert Burns', nickname: 'Durinho', record: '22-8-0', country: 'Brazil', weightClass: 'Welterweight', ranking: 4, stats: s(50, 48, 183, 178, 39, 1) },
  { name: 'Leon Edwards', record: '22-5-0', country: 'UK', weightClass: 'Welterweight', ranking: 5, stats: s(48, 38, 188, 183, 33, 0) },
  { name: 'Colby Covington', record: '17-4-0', country: 'USA', weightClass: 'Welterweight', stats: s(46, 52, 188, 180, 36, 0) },
  // Lightweight
  { name: 'Islam Makhachev', record: '27-1-0', country: 'Russia', weightClass: 'Lightweight', ranking: 1, stats: s(56, 56, 178, 178, 33, 5) },
  { name: 'Arman Tsarukyan', record: '22-3-0', country: 'Armenia', weightClass: 'Lightweight', ranking: 2, stats: s(52, 45, 177, 170, 28, 2) },
  { name: 'Charles Oliveira', nickname: 'Do Bronxs', record: '35-10-0', country: 'Brazil', weightClass: 'Lightweight', ranking: 3, stats: s(55, 40, 188, 178, 35, 1) },
  { name: 'Dustin Poirier', record: '30-9-0', country: 'USA', weightClass: 'Lightweight', ranking: 4, stats: s(52, 38, 183, 175, 35, 0) },
  { name: 'Mateusz Gamrot', record: '25-3-0', country: 'Poland', weightClass: 'Lightweight', ranking: 5, stats: s(50, 48, 180, 178, 34, 2) },
  { name: 'Dan Hooker', nickname: 'The Hangman', record: '24-12-0', country: 'New Zealand', weightClass: 'Lightweight', stats: s(48, 35, 192, 183, 35, 1) },
  // Featherweight
  { name: 'Ilia Topuria', record: '16-0-0', country: 'Spain', weightClass: 'Featherweight', ranking: 1, stats: s(58, 40, 178, 173, 28, 6) },
  { name: 'Alexander Volkanovski', nickname: 'The Great', record: '27-4-0', country: 'Australia', weightClass: 'Featherweight', ranking: 2, stats: s(57, 38, 182, 168, 36, 0) },
  { name: 'Diego Lopes', record: '26-7-0', country: 'Mexico', weightClass: 'Featherweight', ranking: 3, stats: s(52, 38, 178, 175, 30, 3) },
  { name: 'Max Holloway', nickname: 'Blessed', record: '26-8-0', country: 'USA', weightClass: 'Featherweight', ranking: 4, stats: s(47, 42, 175, 180, 33, 0) },
  { name: 'Yair Rodriguez', record: '21-5-0', country: 'Mexico', weightClass: 'Featherweight', ranking: 5, stats: s(46, 32, 180, 180, 32, 1) },
  // Bantamweight
  { name: 'Merab Dvalishvili', record: '19-4-0', country: 'Georgia', weightClass: 'Bantamweight', ranking: 1, stats: s(48, 38, 165, 168, 34, 4) },
  { name: 'Sean O\'Malley', nickname: 'Suga', record: '18-2-0', country: 'USA', weightClass: 'Bantamweight', ranking: 2, stats: s(61, 30, 183, 180, 30, 0) },
  { name: 'Cory Sandhagen', record: '18-5-0', country: 'USA', weightClass: 'Bantamweight', ranking: 3, stats: s(49, 36, 178, 178, 33, 2) },
  { name: 'Petr Yan', record: '18-5-0', country: 'Russia', weightClass: 'Bantamweight', ranking: 4, stats: s(52, 44, 170, 168, 31, 1) },
  { name: 'Umar Nurmagomedov', record: '18-0-0', country: 'Russia', weightClass: 'Bantamweight', ranking: 5, stats: s(54, 48, 175, 173, 29, 4) },
  // Flyweight
  { name: 'Alexandre Pantoja', record: '29-5-0', country: 'Brazil', weightClass: 'Flyweight', ranking: 1, stats: s(50, 45, 175, 165, 34, 2) },
  { name: 'Joshua Van', record: '15-2-0', country: 'Myanmar', weightClass: 'Flyweight', ranking: 2, stats: s(54, 38, 175, 165, 27, 4) },
  { name: 'Brandon Moreno', record: '21-8-0', country: 'Mexico', weightClass: 'Flyweight', ranking: 3, stats: s(48, 40, 170, 170, 31, 0) },
  { name: 'Amir Albazi', record: '17-2-0', country: 'Iraq', weightClass: 'Flyweight', ranking: 4, stats: s(47, 42, 173, 168, 30, 2) },
  // Women
  { name: 'Kayla Harrison', record: '18-1-0', country: 'USA', weightClass: 'Women\'s Bantamweight', ranking: 1, stats: s(55, 52, 163, 170, 35, 3) },
  { name: 'Julianna Peña', record: '12-5-0', country: 'USA', weightClass: 'Women\'s Bantamweight', ranking: 2, stats: s(48, 42, 168, 168, 35, 1) },
  { name: 'Weili Zhang', record: '25-3-0', country: 'China', weightClass: 'Women\'s Strawweight', ranking: 1, stats: s(51, 45, 160, 163, 35, 2) },
  { name: 'Tatiana Suarez', record: '10-0-0', country: 'USA', weightClass: 'Women\'s Strawweight', ranking: 2, stats: s(53, 50, 163, 165, 33, 5) },
  { name: 'Alexa Grasso', record: '16-3-1', country: 'Mexico', weightClass: 'Women\'s Flyweight', ranking: 1, stats: s(52, 36, 163, 163, 31, 0) },
  { name: 'Erin Blanchfield', record: '18-2-0', country: 'USA', weightClass: 'Women\'s Flyweight', ranking: 2, stats: s(51, 44, 165, 163, 25, 3) },
]

export function buildAllRosters(): Record<OrganizationId, OrganizationRoster> {
  return {
    ufc: roster('ufc', ufcSeeds),
  }
}

/** Compteurs par organisation (utile pour scripts / tests) */
export function getSeedCounts(): Record<OrganizationId, number> {
  return {
    ufc: ufcSeeds.length,
  }
}
