import { buildMatchupAdvantage } from '@/lib/prediction-adjustment'
import { fighterShortName } from '@/lib/prediction-verdict'
import { buildFighterMethodProfile } from '@/services/prediction/method-profile'
import { filterRecentBoutsWindow } from '@/lib/recent-bouts'
import type { Fight, Fighter } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'
import type { FighterScoreProfile } from '@/types/prediction'

export type PredictionKeyFactor = {
  label: string
  leaderName: string
  leaderCorner: 'red' | 'blue'
  edge: number
  /** Sous-texte (ex. justification de l'avantage matchup). */
  detail?: string
}

type FactorSpec = {
  label: string
  /** false = facteur ignoré si les deux combattants n'ont pas de données exploitables */
  score: (fight: Fight) => { red: number; blue: number; reliable: boolean }
}

const MIN_EDGE = 4

function statValue(fighter: Fighter, key: keyof Fighter['stats'], fallback?: number): number | undefined {
  const value = fighter.stats[key]
  return typeof value === 'number' ? value : fallback
}

function statAvg(fighter: Fighter, keys: (keyof Fighter['stats'])[]): number | undefined {
  const values = keys
    .map((key) => fighter.stats[key])
    .filter((value): value is number => typeof value === 'number')
  if (values.length === 0) return undefined
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/** Profil Hexagone / roster léger : stats 50/40/55 sans SLpM ni précision réelle. */
function hasPlaceholderStatBlock(fighter: Fighter): boolean {
  const s = fighter.stats
  const def = s.strikeDefense ?? s.strDef
  const tdDef = s.takedownDefense ?? s.tdDef
  return (
    s.strikingAccuracy === 50 &&
    s.takedownAccuracy === 40 &&
    def === 55 &&
    tdDef === 55 &&
    s.slpm == null &&
    s.sapm == null
  )
}

function hasRealStrikingStats(fighter: Fighter): boolean {
  if (hasPlaceholderStatBlock(fighter)) return false
  return statValue(fighter, 'slpm') != null || fighter.stats.strikingAccuracy !== 50
}

function hasRealGrapplingStats(fighter: Fighter): boolean {
  if (hasPlaceholderStatBlock(fighter)) return false
  const tdAcc = fighter.stats.takedownAccuracy
  const tdDef = statAvg(fighter, ['takedownDefense', 'tdDef'])
  return tdAcc !== 40 && tdDef != null && tdDef !== 55
}

function inferredWinStreak(fighter: Fighter): number {
  const streak = fighter.stats.winStreak ?? 0
  if (streak > 0) return streak
  const losses = fighter.losses ?? 0
  const wins = fighter.wins ?? 0
  if (losses === 0 && wins > 0) return wins
  return 0
}

function parseRecord(fighter: Fighter): { wins: number; losses: number; draws: number; total: number } {
  const wins = fighter.wins ?? 0
  const losses = fighter.losses ?? 0
  const draws = fighter.draws ?? 0
  const total = wins + losses + draws
  if (total > 0) return { wins, losses, draws, total }

  const m = fighter.record?.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/)
  if (m) {
    const w = Number(m[1])
    const l = Number(m[2])
    const d = Number(m[3])
    return { wins: w, losses: l, draws: d, total: w + l + d }
  }
  return { wins: 0, losses: 0, draws: 0, total: 0 }
}

/** Bilan carrière : ratio victoires, invaincu, série en cours. */
function careerFormScore(fighter: Fighter): number {
  const { wins, losses, total } = parseRecord(fighter)
  if (total === 0) return 50

  const winRate = (wins / total) * 100
  const unbeatenBonus = losses === 0 && wins >= 2 ? 14 : 0
  const streakBonus = Math.min(12, inferredWinStreak(fighter) * 4)
  const lossDrag =
    losses >= 4 ? Math.min(18, (losses - 3) * 2.5) : losses >= 2 ? (losses - 1) * 1.5 : 0

  return Math.min(98, Math.max(22, winRate * 0.62 + unbeatenBonus + streakBonus - lossDrag + 18))
}

/** Combats récents (< 2 ans) — sans accès disque (compatible client). */
function recentBoutsForFactors(fighter: Fighter): FighterRecentBout[] {
  if (!fighter.recentBouts?.length) return []
  return filterRecentBoutsWindow(fighter.recentBouts)
}

/** Forme sur les 5 derniers combats documentés (< 2 ans). */
function documentedRecentFormScore(fighter: Fighter): number | null {
  const bouts = recentBoutsForFactors(fighter)
  if (bouts.length === 0) return null

  const wins = bouts.filter((b) => b.result === 'win').length
  const losses = bouts.filter((b) => b.result === 'loss').length
  const n = bouts.length
  const winPct = (wins / n) * 100
  const tierAvg = bouts.reduce((s, b) => s + b.opponentTier, 0) / n

  return Math.min(
    98,
    Math.max(
      20,
      winPct * 0.55 + tierAvg * 0.25 + Math.min(12, inferredWinStreak(fighter) * 3) - losses * 6,
    ),
  )
}

/**
 * Dynamique récente : résultats récents documentés en priorité, sinon bilan carrière
 * (un 3-0 invaincu bat un 11-7 avec 7 défaites).
 */
function recentFormScore(fighter: Fighter): number {
  const documented = documentedRecentFormScore(fighter)
  const career = careerFormScore(fighter)
  if (documented != null) return documented * 0.72 + career * 0.28
  return career
}

/** % victoires par KO/TKO + volume + taux de finish au bilan. */
function koPowerScore(fighter: Fighter): number {
  const profile = buildFighterMethodProfile(fighter)
  const koWinPct = profile.winKoPct
  const slpm = statValue(fighter, 'slpm')
  const volumeScore = slpm != null ? Math.min(100, (slpm / 5.8) * 100) : 50
  const finishRate = statValue(fighter, 'finishingRate') ?? koWinPct

  const volumeWeight = slpm != null ? 0.25 : 0.1
  return koWinPct * 0.55 + volumeScore * volumeWeight + finishRate * (0.45 - volumeWeight)
}

function strikingScore(fighter: Fighter): number | null {
  if (!hasRealStrikingStats(fighter)) return null
  const acc = fighter.stats.strikingAccuracy
  const slpm = statValue(fighter, 'slpm') ?? 3.2
  const sapm = statValue(fighter, 'sapm') ?? 3.5
  const volume = Math.min(100, (slpm / 5.5) * 100)
  const defense = Math.max(0, 100 - (sapm / 5.5) * 100)
  return acc * 0.45 + volume * 0.3 + defense * 0.25
}

function defenseScore(fighter: Fighter): number | null {
  if (hasPlaceholderStatBlock(fighter)) return null
  const strikeDef = statAvg(fighter, ['strikeDefense', 'strDef'])
  const sapm = statValue(fighter, 'sapm')
  if (strikeDef == null && sapm == null) return null
  const def = strikeDef ?? 50
  const absorption = sapm != null ? Math.max(0, 100 - (sapm / 5.5) * 100) : 50
  return def * 0.6 + absorption * 0.4
}

function grapplingScore(fighter: Fighter): number | null {
  if (!hasRealGrapplingStats(fighter)) return null
  const tdAcc = fighter.stats.takedownAccuracy
  const tdDef = statAvg(fighter, ['takedownDefense', 'tdDef']) ?? 50
  const subAvg = statValue(fighter, 'subAvg') ?? 0
  const subThreat = Math.min(100, subAvg * 22)
  return tdAcc * 0.35 + tdDef * 0.45 + subThreat * 0.2
}

function breakdownBlend(
  fight: Fight,
  key: keyof FighterScoreProfile,
  redStat: number,
  blueStat: number,
  statWeight = 0.65,
): { red: number; blue: number } {
  const breakdown = fight.model.breakdown
  if (!breakdown) return { red: redStat, blue: blueStat }
  return {
    red: redStat * statWeight + breakdown.red[key] * 100 * (1 - statWeight),
    blue: blueStat * statWeight + breakdown.blue[key] * 100 * (1 - statWeight),
  }
}

function scorePair(
  red: number | null,
  blue: number | null,
): { red: number; blue: number; reliable: boolean } {
  if (red == null || blue == null) return { red: 50, blue: 50, reliable: false }
  return { red, blue, reliable: true }
}

const FACTOR_SPECS: FactorSpec[] = [
  {
    label: 'Précision de frappe',
    score: (fight) => {
      const red = strikingScore(fight.redCorner)
      const blue = strikingScore(fight.blueCorner)
      if (red == null || blue == null) return scorePair(null, null)
      const blended = breakdownBlend(fight, 'striking', red, blue)
      return { ...blended, reliable: true }
    },
  },
  {
    label: 'Défense',
    score: (fight) => scorePair(defenseScore(fight.redCorner), defenseScore(fight.blueCorner)),
  },
  {
    label: 'Grappling',
    score: (fight) => {
      const red = grapplingScore(fight.redCorner)
      const blue = grapplingScore(fight.blueCorner)
      if (red == null || blue == null) return scorePair(null, null)
      const blended = breakdownBlend(fight, 'grappling', red, blue)
      return { ...blended, reliable: true }
    },
  },
  {
    label: 'Dynamique récente',
    score: (fight) => ({
      red: recentFormScore(fight.redCorner),
      blue: recentFormScore(fight.blueCorner),
      reliable: true,
    }),
  },
  {
    label: 'KO power',
    score: (fight) => ({
      red: koPowerScore(fight.redCorner),
      blue: koPowerScore(fight.blueCorner),
      reliable: true,
    }),
  },
  {
    label: 'Bilan carrière',
    score: (fight) => ({
      red: careerFormScore(fight.redCorner),
      blue: careerFormScore(fight.blueCorner),
      reliable: true,
    }),
  },
]

function pickLeader(
  fight: Fight,
  red: number,
  blue: number,
): { leader: Fighter; corner: 'red' | 'blue'; edge: number } {
  const redWins = red >= blue
  const leader = redWins ? fight.redCorner : fight.blueCorner
  return {
    leader,
    corner: redWins ? 'red' : 'blue',
    edge: Math.abs(Math.round(red - blue)),
  }
}

function rankStatKeyFactors(fight: Fight, limit = 5): PredictionKeyFactor[] {
  const ranked = FACTOR_SPECS.map((spec) => {
    const { red, blue, reliable } = spec.score(fight)
    const { leader, corner, edge } = pickLeader(fight, red, blue)
    return {
      label: spec.label,
      leaderName: fighterShortName(leader.name),
      leaderCorner: corner,
      edge,
      reliable,
    }
  })
    .filter((item) => item.reliable && item.edge >= MIN_EDGE)
    .sort((a, b) => b.edge - a.edge)

  const deduped = ranked.filter(
    (item) =>
      item.label !== 'Bilan carrière' ||
      !ranked.some(
        (other) => other.label === 'Dynamique récente' && other.edge >= item.edge,
      ),
  )

  if (deduped.length >= 3) return deduped.slice(0, limit)

  const fallback = FACTOR_SPECS.filter((spec) => spec.score(fight).reliable)
    .map((spec) => {
      const { red, blue } = spec.score(fight)
      const { leader, corner, edge } = pickLeader(fight, red, blue)
      return {
        label: spec.label,
        leaderName: fighterShortName(leader.name),
        leaderCorner: corner,
        edge: Math.max(edge, 1),
      }
    })
    .filter((item) => item.edge > 0)
    .sort((a, b) => b.edge - a.edge)

  return fallback.slice(0, limit)
}

/** 3 à 5 facteurs MMA visibles gratuitement sous chaque pronostic. */
export function getPredictionKeyFactors(fight: Fight, limit = 5): PredictionKeyFactor[] {
  const statFactors = rankStatKeyFactors(fight, limit)
  const matchup = buildMatchupAdvantage(
    fight,
    statFactors.map((factor) => factor.leaderCorner),
  )

  if (!matchup) return statFactors

  const matchupFactor: PredictionKeyFactor = {
    label: matchup.label,
    leaderName: matchup.leaderName,
    leaderCorner: matchup.leaderCorner,
    edge: matchup.edge,
    detail: matchup.detail,
  }

  return [matchupFactor, ...statFactors].slice(0, limit)
}

export const PREMIUM_ANALYSIS_FEATURES = [
  'Analyse complète du combat',
  'Comparaison statistique détaillée',
  'Facteurs décisifs',
  'Niveau de risque',
  'Justification du pronostic',
  'Score complet du modèle',
] as const
