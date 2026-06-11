import { fighterShortName } from '@/lib/prediction-verdict'
import { PREDICTION_OVERRIDES, UFC_MARKET_ODDS } from '@/lib/prediction/market-odds'
import type { Fight, Fighter } from '@/types'
import type { FighterScoreProfile } from '@/types/prediction'

export type PredictionAdjustment = {
  note: string
  kind: 'editorial' | 'matchup'
}

export type MatchupAdvantage = {
  label: 'Avantage matchup'
  leaderName: string
  leaderCorner: 'red' | 'blue'
  edge: number
  detail: string
}

const MIN_BLEND_ADJUSTMENT_DELTA = 6

const BREAKDOWN_DIMS = [
  'striking',
  'grappling',
  'physical',
  'momentum',
  'schedule',
  'recentForm',
] as const satisfies readonly (keyof FighterScoreProfile)[]

const BREAKDOWN_DIM_LABELS: Record<(typeof BREAKDOWN_DIMS)[number], string> = {
  striking: 'la frappe',
  grappling: 'le grappling',
  physical: 'la portée et le gabarit',
  momentum: 'la dynamique',
  schedule: "le niveau d'opposition affronté",
  recentForm: 'la forme récente',
}

/**
 * Lecture matchup validée manuellement — ton analyse, pas les cotes.
 * Utilisée pour les notes d'ajustement et le facteur « Avantage matchup ».
 */
export const MATCHUP_READ_OVERRIDES: Record<string, string> = {
  'ufc-freedom-250-f1':
    'Topuria impose pression, précision et constance — Gaethje a le power mais devra tenir sur la distance face à un champion invaincu qui monte en volume.',
  'ufc-freedom-250-f2':
    'Gane gagne sur la mobilité et la gestion à distance — Pereira doit toucher pour imposer son power, plus difficile sur 5 rounds.',
  'ufc-freedom-250-f4':
    "Hokit arrive avec la dynamique et l'athlétisme pour dicter le rythme — Lewis a l'expérience mais le profil récent et le tempo du prospect basculent le matchup.",
  'ufc-freedom-250-f5':
    'Ruffy combine volume, portée et taux de finish — Chandler reste dangereux mais le tempo et la forme récente du Brésilien font la différence sur 3 rounds.',
  'ufc-freedom-250-f3':
    "O'Malley conserve l'avantage en boxe, reach et gestion de distance malgré la dynamique récente de Zahabi.",
  'ufc-freedom-250-f6':
    'Nickal domine la lutte et le contrôle des transitions — Daukaus part avec de la forme mais le niveau au sol bascule le matchup.',
  'ufc-freedom-250-f7':
    'Lopes impose son grappling et a affronté une opposition plus relevée — Garcia part fort sur la forme récente mais le profil global favorise Lopes.',
  'hexagone-mma-45-f1':
    'Navero arrive invaincu avec un profil de finisseur et une dynamique nette — Baybatyrov a l\'expérience mais le rythme et la forme récente du Français basculent ce catchweight.',
  'hexagone-mma-45-f2':
    'Sima impose tempo et taux de finish sur un palmarès clean — Barbosa a le volume de combat mais la dynamique et la constance du Français font pencher le matchup.',
  'hexagone-mma-45-f3':
    'Aschenbrenner part invaincue avec une edge en finitions et dynamique — Grandjean a l\'expérience mais le profil récent et le style du matchup favorisent Aschenbrenner.',
  'hexagone-mma-45-f4':
    'Agbo combine dynamique, finitions et opposition plus relevée — Lapilus a l\'expérience mais le bilan et le profil du matchup jouent pour le plus jeune.',
  'hexagone-mma-45-f5':
    'Ouattara arrive avec un vrai palmarès et un profil de finisseur — Azizoun fait ses débuts pro dans un matchup exigeant où l\'expérience fait la différence.',
  'hexagone-mma-45-f6':
    'Ozturk impose son rythme et sa dynamique — Bahaji a le bilan récent mais le tempo et le profil du matchup jouent pour Ozturk.',
  'hexagone-mma-45-f7':
    'Landouzy part avec un edge en frappe et finish — Hussainkhil reste dangereux mais le tempo et le profil du Français basculent ce bantamweight.',
  'hexagone-mma-45-f8':
    'Bendaho impose rythme et dynamique sur un bilan plus solide — Delattre garde des atouts mais le volume récent et le profil du matchup favorisent Bendaho.',
  'hexagone-mma-45-f9':
    'Albiekov arrive avec la dynamique et un bilan plus clean — Di Guardo a l\'expérience lourds mais le profil récent et le tempo basculent le matchup.',
  'hexagone-mma-45-f10':
    'Ammar part avec un palmarès plus construit et une opposition relevée — Khettou reste dangereux mais le volume et la constance d\'Ammar font la différence.',
}

/** @deprecated Utiliser MATCHUP_READ_OVERRIDES */
export const MATCHUP_REASON_OVERRIDES = MATCHUP_READ_OVERRIDES

type AdjustmentFight = Pick<Fight, 'id' | 'model' | 'redCorner' | 'blueCorner'>

function favoriteCorner(fight: Pick<Fight, 'model'>): 'red' | 'blue' {
  return fight.model.redWinProbability >= 50 ? 'red' : 'blue'
}

function favoriteFighter(fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner'>): Fighter {
  return favoriteCorner(fight) === 'red' ? fight.redCorner : fight.blueCorner
}

function opponentFighter(fight: AdjustmentFight, corner: 'red' | 'blue'): Fighter {
  return corner === 'red' ? fight.blueCorner : fight.redCorner
}

function formatDimPhrase(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]!
  if (labels.length === 2) return `${labels[0]} et ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`
}

function cleanOverrideReason(reason: string): string {
  return reason
    .replace(/^Pick éditorial\s*:\s*/i, '')
    .replace(/^Notre lecture\s*:\s*/i, '')
    .replace(/^Alignement bookmakers[^:]*:\s*/i, '')
    .trim()
}

function leadingBreakdownLabels(fight: AdjustmentFight, corner: 'red' | 'blue'): string[] {
  const breakdown = fight.model.breakdown
  if (!breakdown) return []

  const fav = corner === 'red' ? breakdown.red : breakdown.blue
  const opp = corner === 'red' ? breakdown.blue : breakdown.red

  return BREAKDOWN_DIMS.filter((dim) => fav[dim] > opp[dim]).map(
    (dim) => BREAKDOWN_DIM_LABELS[dim],
  )
}

function buildMatchupRead(fight: AdjustmentFight, favCorner: 'red' | 'blue'): string {
  const curated = MATCHUP_READ_OVERRIDES[fight.id]
  if (curated) return curated

  const override = PREDICTION_OVERRIDES[fight.id]
  if (override?.winnerCorner === favCorner) {
    return cleanOverrideReason(override.reason)
  }

  const favName = fighterShortName(favoriteFighter(fight).name)
  const oppName = fighterShortName(opponentFighter(fight, favCorner).name)
  const dims = leadingBreakdownLabels(fight, favCorner)
  const dimPhrase = formatDimPhrase(dims)

  if (dimPhrase) {
    return `${favName} part avec un edge sur ${dimPhrase} face à ${oppName} dans ce style de combat.`
  }

  return `Le profil de ${favName} colle mieux à ce matchup face à ${oppName} selon notre modèle multi-critères.`
}

function formatAdjustmentNote(read: string): string {
  return `Notre lecture du matchup : ${read}`
}

export function buildPredictionAdjustment(
  fight: AdjustmentFight,
  rawRedWinProbability: number,
): PredictionAdjustment | null {
  const finalRedWinProbability = fight.model.redWinProbability
  const override = PREDICTION_OVERRIDES[fight.id]

  const finalFavCorner = favoriteCorner(fight)

  if (override) {
    return {
      note: formatAdjustmentNote(cleanOverrideReason(override.reason)),
      kind: 'editorial',
    }
  }

  const curated = MATCHUP_READ_OVERRIDES[fight.id]
  if (curated) {
    return {
      note: formatAdjustmentNote(curated),
      kind: 'matchup',
    }
  }

  const market = UFC_MARKET_ODDS[fight.id]
  if (!market) return null

  const rawFavCorner: 'red' | 'blue' =
    rawRedWinProbability >= 50 ? 'red' : 'blue'
  const delta = Math.abs(rawRedWinProbability - finalRedWinProbability)
  const favoriteFlipped = rawFavCorner !== finalFavCorner

  if (!favoriteFlipped && delta < MIN_BLEND_ADJUSTMENT_DELTA) return null

  return {
    note: formatAdjustmentNote(buildMatchupRead(fight, finalFavCorner)),
    kind: 'matchup',
  }
}

export function detectFactorVerdictMismatch(
  fight: Fight,
  factorCorners: Array<'red' | 'blue'>,
): boolean {
  if (factorCorners.length === 0) return false

  const favCorner = favoriteCorner(fight)
  const favWins = factorCorners.filter((corner) => corner === favCorner).length
  const oppWins = factorCorners.length - favWins
  return favWins < oppWins
}

export function buildMatchupAdvantage(
  fight: Fight,
  statFactorCorners: Array<'red' | 'blue'>,
): MatchupAdvantage | null {
  if (!detectFactorVerdictMismatch(fight, statFactorCorners)) return null

  const favCorner = favoriteCorner(fight)
  const fav = favoriteFighter(fight)
  const favWins = statFactorCorners.filter((corner) => corner === favCorner).length
  const oppWins = statFactorCorners.length - favWins

  return {
    label: 'Avantage matchup',
    leaderName: fighterShortName(fav.name),
    leaderCorner: favCorner,
    edge: Math.max(5, oppWins - favWins + 4),
    detail: buildMatchupRead(fight, favCorner),
  }
}
