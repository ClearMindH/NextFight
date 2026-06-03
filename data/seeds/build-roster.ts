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
  { name: 'Ciryl Gane', record: '12-2-0', country: 'France', weightClass: 'Heavyweight', ranking: 3, stats: s(58, 33, 206, 193, 34, 1) },
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

// ─── PFL ───────────────────────────────────────────────────────────────────

export const pflSeeds: SeedInput[] = [
  // Heavyweight
  { name: 'Renan Ferreira', nickname: 'Problema', record: '14-2-0', country: 'Brazil', weightClass: 'Heavyweight', ranking: 1, stats: s(48, 36, 206, 203, 35, 4) },
  { name: 'Ryan Edwards', record: '14-3-0', country: 'UK', weightClass: 'Heavyweight', ranking: 2, stats: s(46, 40, 198, 193, 31, 2) },
  { name: 'Patrick Habirora', record: '10-0-0', country: 'Belgium', weightClass: 'Heavyweight', stats: s(50, 42, 198, 193, 28, 4) },
  { name: 'Denis Golts', record: '12-2-0', country: 'Russia', weightClass: 'Heavyweight', stats: s(49, 38, 195, 191, 30, 2) },
  // Light Heavyweight
  { name: 'Fabian Edwards', record: '14-3-0', country: 'UK', weightClass: 'Light Heavyweight', ranking: 1, stats: s(51, 38, 188, 185, 31, 2) },
  { name: 'Johnny Mix', record: '16-2-0', country: 'USA', weightClass: 'Light Heavyweight', ranking: 2, stats: s(49, 42, 185, 183, 29, 3) },
  { name: 'Thibault Gouti', record: '9-3-0', country: 'France', weightClass: 'Light Heavyweight', stats: s(47, 36, 188, 183, 34, 1) },
  // Middleweight
  { name: 'Logan Storley', record: '17-2-0', country: 'USA', weightClass: 'Middleweight', ranking: 1, stats: s(48, 52, 183, 180, 32, 2) },
  { name: 'Magomed Umalatov', record: '17-0-0', country: 'Russia', weightClass: 'Welterweight', ranking: 1, stats: s(54, 45, 185, 183, 29, 4) },
  // Lightweight
  { name: 'Usman Nurmagomedov', record: '18-0-0', country: 'Russia', weightClass: 'Lightweight', ranking: 1, stats: s(55, 50, 178, 175, 26, 6) },
  { name: 'Benson Henderson', record: '31-12-0', country: 'USA', weightClass: 'Lightweight', stats: s(46, 40, 178, 175, 41, 0) },
  { name: 'Olivier Aubin-Mercier', nickname: 'The Canadian Gangster', record: '21-5-0', country: 'Canada', weightClass: 'Lightweight', stats: s(50, 38, 180, 178, 36, 2) },
  { name: 'Brent Primus', record: '12-3-0', country: 'USA', weightClass: 'Lightweight', stats: s(47, 44, 178, 175, 35, 1) },
  // Featherweight
  { name: 'Bekkhan Khaybulaev', nickname: 'Bek', record: '14-0-1', country: 'Russia', weightClass: 'Featherweight', ranking: 1, stats: s(52, 48, 180, 175, 30, 5) },
  { name: 'Shane Burgos', record: '16-4-0', country: 'USA', weightClass: 'Featherweight', stats: s(52, 36, 178, 175, 32, 1) },
  { name: 'Gabriel Braga', record: '12-1-0', country: 'Brazil', weightClass: 'Featherweight', stats: s(51, 32, 180, 175, 27, 3) },
  // Women
  { name: 'Dakota Ditcheva', record: '12-0-0', country: 'UK', weightClass: 'Women\'s Flyweight', ranking: 1, stats: s(58, 35, 165, 168, 26, 5) },
  { name: 'Liz Carmouche', record: '20-7-0', country: 'USA', weightClass: 'Women\'s Flyweight', stats: s(47, 44, 163, 163, 41, 1) },
  { name: 'Denise Kielholtz', record: '8-5-0', country: 'Netherlands', weightClass: 'Women\'s Flyweight', stats: s(49, 40, 165, 168, 35, 1) },
  { name: 'Larissa Pacheco', record: '23-4-0', country: 'Brazil', weightClass: 'Women\'s Featherweight', stats: s(50, 38, 170, 170, 32, 2) },
  { name: 'Julia Budd', record: '17-6-0', country: 'Canada', weightClass: 'Women\'s Featherweight', stats: s(48, 42, 168, 168, 40, 0) },
]

// ─── KSW ───────────────────────────────────────────────────────────────────

export const kswSeeds: SeedInput[] = [
  // Heavyweight
  { name: 'Karol Szymanski', record: '9-1-0', country: 'Poland', weightClass: 'Heavyweight', ranking: 1, stats: s(50, 35, 198, 196, 30, 3) },
  { name: 'Marian Ziółkowski', record: '25-9-1', country: 'Poland', weightClass: 'Heavyweight', ranking: 2, stats: s(48, 36, 195, 193, 35, 1) },
  { name: 'Anthony Johnson', record: '23-14-0', country: 'USA', weightClass: 'Heavyweight', stats: s(52, 38, 193, 188, 40, 0) },
  // Light Heavyweight
  { name: 'Radosław Baran', record: '15-4-0', country: 'Poland', weightClass: 'Light Heavyweight', ranking: 1, stats: s(50, 42, 190, 188, 32, 2) },
  { name: 'Tomasz Narkun', record: '36-8-0', country: 'Poland', weightClass: 'Light Heavyweight', stats: s(46, 45, 188, 185, 38, 0) },
  { name: 'Igor Wojtasik', record: '11-2-0', country: 'Poland', weightClass: 'Light Heavyweight', stats: s(49, 40, 188, 186, 29, 3) },
  // Middleweight
  { name: 'Mamed Khalidov', nickname: 'Cannibal', record: '35-9-2', country: 'Poland', weightClass: 'Middleweight', ranking: 1, stats: s(49, 44, 185, 185, 43, 2) },
  { name: 'Antonio Carlos Junior', nickname: 'Soldić', record: '25-5-0', country: 'Croatia', weightClass: 'Middleweight', ranking: 2, stats: s(52, 41, 188, 188, 34, 3) },
  { name: 'Paweł Polityło', record: '18-4-0', country: 'Poland', weightClass: 'Middleweight', stats: s(47, 43, 185, 183, 33, 1) },
  // Welterweight
  { name: 'Michał Dufka', record: '12-1-0', country: 'Poland', weightClass: 'Welterweight', ranking: 1, stats: s(51, 38, 188, 185, 28, 4) },
  { name: 'Kamil Michalski', record: '11-2-0', country: 'Poland', weightClass: 'Welterweight', ranking: 2, stats: s(48, 42, 185, 183, 27, 2) },
  { name: 'Bartosz Kuncer', record: '8-1-0', country: 'Poland', weightClass: 'Welterweight', stats: s(49, 40, 185, 183, 27, 4) },
  { name: 'Maksymilian Szulc', record: '10-2-0', country: 'Poland', weightClass: 'Welterweight', stats: s(50, 36, 186, 183, 26, 2) },
  // Lightweight
  { name: 'Islam Nurmagomedov', record: '14-0-0', country: 'Russia', weightClass: 'Lightweight', ranking: 1, stats: s(55, 48, 180, 178, 26, 5) },
  { name: 'Damian Zwosta', record: '10-3-0', country: 'Poland', weightClass: 'Lightweight', ranking: 2, stats: s(47, 40, 178, 180, 29, 2) },
  { name: 'Ludovít Klein', record: '22-5-0', country: 'Slovakia', weightClass: 'Lightweight', stats: s(54, 38, 180, 178, 31, 1) },
  // Featherweight
  { name: 'Scott Askew', record: '10-2-0', country: 'UK', weightClass: 'Featherweight', ranking: 1, stats: s(52, 36, 180, 178, 29, 3) },
  { name: 'Kacper Kropiwiec', record: '9-1-0', country: 'Poland', weightClass: 'Featherweight', stats: s(48, 34, 178, 175, 27, 4) },
  { name: 'Daniel Torres', record: '14-5-0', country: 'Spain', weightClass: 'Featherweight', stats: s(50, 38, 178, 173, 30, 2) },
]

// ─── ARES ──────────────────────────────────────────────────────────────────

export const aresSeeds: SeedInput[] = [
  // Heavyweight
  { name: 'Ciryl Gane', record: '12-2-0', country: 'France', weightClass: 'Heavyweight', ranking: 1, stats: s(58, 33, 206, 193, 34, 1) },
  { name: 'Ibo Aslan', record: '14-2-0', country: 'Turkey', weightClass: 'Light Heavyweight', ranking: 1, stats: s(54, 30, 190, 188, 29, 3) },
  { name: 'Cedric Doumbe', record: '5-1-0', country: 'France', weightClass: 'Welterweight', ranking: 1, stats: s(56, 28, 190, 183, 36, 2) },
  { name: 'Axel Sola', record: '10-1-0', country: 'France', weightClass: 'Welterweight', stats: s(50, 36, 185, 183, 27, 3) },
  { name: 'Kevin Cureau', record: '12-3-0', country: 'France', weightClass: 'Lightweight', stats: s(48, 40, 178, 175, 30, 2) },
  { name: 'Jordan Vucenic', record: '13-3-0', country: 'France', weightClass: 'Lightweight', stats: s(49, 38, 178, 175, 31, 2) },
  { name: 'Thibault Gouti', record: '9-3-0', country: 'France', weightClass: 'Lightweight', stats: s(47, 36, 178, 175, 34, 1) },
  // Featherweight
  { name: 'Salahdine Parnasse', record: '8-0-0', country: 'France', weightClass: 'Featherweight', ranking: 1, stats: s(55, 42, 178, 175, 26, 4) },
  { name: 'Morgan Charriere', record: '20-10-1', country: 'France', weightClass: 'Featherweight', ranking: 2, stats: s(52, 36, 180, 175, 33, 0) },
  { name: 'Yves Landu', record: '20-9-0', country: 'France', weightClass: 'Featherweight', stats: s(50, 38, 175, 170, 35, 1) },
  { name: 'Anthony Ribeiro', record: '11-2-0', country: 'France', weightClass: 'Featherweight', stats: s(51, 34, 178, 175, 28, 3) },
  // Bantamweight
  { name: 'Taylor Lapilus', record: '21-4-0', country: 'France', weightClass: 'Bantamweight', ranking: 1, stats: s(51, 40, 178, 175, 34, 2) },
  { name: 'Rimbo Gazikov', record: '9-1-0', country: 'Russia', weightClass: 'Bantamweight', stats: s(52, 44, 175, 170, 28, 4) },
  { name: 'Mehdi Zatout', record: '14-5-0', country: 'France', weightClass: 'Bantamweight', stats: s(48, 38, 173, 170, 32, 1) },
  { name: 'Bruno Lopes', record: '10-2-0', country: 'France', weightClass: 'Bantamweight', stats: s(49, 36, 175, 173, 29, 2) },
]

// ─── Hexagone MMA ──────────────────────────────────────────────────────────

export const hexagoneSeeds: SeedInput[] = [
  // Middleweight
  { name: 'Marc-André Barriault', record: '17-6-0', country: 'Canada', weightClass: 'Middleweight', ranking: 1, stats: s(51, 35, 188, 185, 34, 3) },
  { name: 'Jordan Harris', record: '12-3-0', country: 'Canada', weightClass: 'Middleweight', ranking: 2, stats: s(47, 42, 185, 183, 28, 4) },
  { name: 'Marc-André Martin', record: '10-2-0', country: 'Canada', weightClass: 'Middleweight', stats: s(49, 38, 186, 183, 30, 2) },
  // Welterweight
  { name: 'Alex Morgan', record: '11-2-0', country: 'Canada', weightClass: 'Welterweight', ranking: 1, stats: s(50, 38, 185, 183, 29, 2) },
  { name: 'Jonathan Meunier', record: '9-1-0', country: 'Canada', weightClass: 'Welterweight', ranking: 2, stats: s(48, 40, 183, 180, 30, 4) },
  { name: 'Steven Warby', record: '8-2-0', country: 'Canada', weightClass: 'Welterweight', stats: s(47, 36, 183, 180, 28, 1) },
  // Lightweight
  { name: 'Pierre Paquette', record: '8-2-0', country: 'Canada', weightClass: 'Lightweight', ranking: 1, stats: s(50, 36, 180, 178, 27, 3) },
  { name: 'Liam Doyle', record: '10-3-0', country: 'Canada', weightClass: 'Lightweight', ranking: 2, stats: s(49, 38, 178, 175, 28, 2) },
  { name: 'Charles Jourdain', record: '15-6-1', country: 'Canada', weightClass: 'Featherweight', stats: s(52, 34, 180, 175, 29, 1) },
  // Featherweight / Bantam / Fly
  { name: 'Steven Siler', record: '32-17-1', country: 'USA', weightClass: 'Featherweight', stats: s(46, 36, 178, 175, 41, 0) },
  { name: 'Jesse Arnett', record: '22-8-0', country: 'Canada', weightClass: 'Bantamweight', ranking: 1, stats: s(47, 40, 175, 170, 36, 2) },
  { name: 'Ali Bagautinov', record: '18-7-0', country: 'Russia', weightClass: 'Flyweight', ranking: 1, stats: s(49, 48, 170, 165, 39, 1) },
  { name: 'Malcolm Gordon', record: '14-7-0', country: 'Canada', weightClass: 'Flyweight', stats: s(48, 42, 173, 168, 34, 1) },
  { name: 'Aiemann Zahabi', record: '11-2-0', country: 'Canada', weightClass: 'Bantamweight', stats: s(50, 38, 175, 173, 31, 3) },
]

export function buildAllRosters(): Record<OrganizationId, OrganizationRoster> {
  return {
    ufc: roster('ufc', ufcSeeds),
    pfl: roster('pfl', pflSeeds),
    ksw: roster('ksw', kswSeeds),
    ares: roster('ares', aresSeeds),
    hexagone: roster('hexagone', hexagoneSeeds),
  }
}

/** Compteurs par organisation (utile pour scripts / tests) */
export function getSeedCounts(): Record<OrganizationId, number> {
  return {
    ufc: ufcSeeds.length,
    pfl: pflSeeds.length,
    ksw: kswSeeds.length,
    ares: aresSeeds.length,
    hexagone: hexagoneSeeds.length,
  }
}
