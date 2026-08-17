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
  'ufc-329-f1':
    'McGregor garde le power, la précision en contre et l\'avantage psychologique du retour — Holloway a le volume mais Conor peut imposer son rythme et toucher en début de combat.',
  'ufc-329-f2':
    'BSD impose pression, chaînage au sol et intensité physique — Pimblett progresse debout mais doit tenir face au grappling et au tempo du Français sur 3 rounds.',
  'ufc-329-f3':
    'Bautista monte en puissance avec wrestling et forme récente — Sandhagen reste dangereux en mouvement mais le profil complet de Bautista fait la différence.',
  'ufc-329-f4':
    'Kavanagh arrive avec le tempo, la confiance et un profil en pleine montée — Royval a l\'expérience mais le Britannique peut imposer son rythme sur 3 rounds.',
  'ufc-329-f5':
    'King Green combine expérience, cardio et lecture de combat — McKinney est explosif mais Green sait absorber le tempo et imposer son rythme sur 5 rounds.',
  'ufc-329-f6':
    'Whittaker garde l\'avantage en striking technique, gestion de distance et fight IQ — Krylov reste dangereux mais Robert est plus fiable sur la durée.',
  'ufc-329-f7':
    'Steveson domine la lutte olympique et le contrôle au sol — Ellison a plus de rounds MMA mais le niveau de wrestling bascule le matchup.',
  'ufc-329-f8':
    'Garbrandt conserve le power et la vitesse en boxe — Yanez est solide mais doit éviter les échanges où le KO de Cody reste le facteur X.',
  'ufc-329-f9':
    'Dutro part avec un léger edge sur la forme récente et le profil physique — Kamaka reste dangereux mais le momentum du champion intérimaire fait pencher la balance.',
  'ufc-329-f10':
    'Cortez impose sa lutte et son expérience UFC — Cong arrive en forme mais doit contenir les takedowns pour tenir la distance.',
  'ufc-329-f11':
    'Almeida combine striking puissant et finitions — Pinas part avec de la forme mais le profil de finisseur brésilien bascule le matchup.',
  'ufc-329-f12':
    'Basharat impose contrôle, grappling et constance — Garza reste dangereux debout mais le tempo et le niveau au sol du Britannique font la différence.',
  'ufc-329-f13':
    'Gandra domine sur le grappling et le contrôle des transitions — Reese part avec de la forme mais le profil au sol bascule nettement le combat.',
  'ufc-329-f14':
    'Costa arrive avec une forme récente excellente, du power et un taux de finish élevé — Durden doit imposer son wrestling pour renverser le favori.',
  'ufc-fight-night-july-18-2026-f1':
    'Du Plessis impose pression, volume et finitions en montée — Usman garde l\'expérience, la défense de takedown et le cardio sur 5 rounds, mais le champion sort d\'une défaite et monte en middleweight.',
  'ufc-fight-night-july-18-2026-f2':
    'Cannonier combine power, expérience UFC et gestion de distance — Leroy Duncan monte en puissance mais doit tenir face au striking et à l\'expérience du vétéran sur 3 rounds.',
  'ufc-fight-night-july-18-2026-f3':
    'Hooper progresse en grappling et finitions — Ramirez part avec de la forme mais le niveau au sol et le volume du prospect basculent le matchup.',
  'ufc-fight-night-july-18-2026-f4':
    'McMillen arrive avec la dynamique et le profil physique — Montes reste dangereux mais le momentum et l\'athlétisme du prospect font pencher la balance.',
  'ufc-fight-night-july-18-2026-f5':
    'Ricci impose volume, pression et expérience — Kline progresse vite mais doit contenir le rythme de la Brésilienne sur la durée.',
  'ufc-fight-night-july-18-2026-f6':
    'Delgado combine finitions et agressivité — Bashi part avec de la forme mais le profil de finisseur et l\'expérience récente basculent le combat.',
  'ufc-fight-night-july-18-2026-f7':
    'Lebosnoyani garde l\'avantage en striking et en reach — Ko reste solide au sol mais doit imposer son wrestling pour renverser le favori debout.',
  'ufc-fight-night-july-18-2026-f8':
    'Franco arrive avec la dynamique et la forme récente — Rodrigues a l\'expérience mais le profil montant du Brésilien fait la différence.',
  'ufc-fight-night-july-18-2026-f9':
    'Coria impose volume et constance — Caliari reste dangereuse mais le tempo et la gestion de distance du prospect basculent le matchup.',
  'ufc-fight-night-july-18-2026-f10':
    'Frye combine puissance et profil physique en heavyweight — Hines part avec de la forme mais le power et l\'athlétisme du favori font pencher la balance.',
  'ufc-fight-night-july-18-2026-f11':
    'Barbosa garde l\'avantage en grappling et en transitions — Hardy a l\'expérience mais le niveau au sol et la forme récente de Dione basculent le combat.',
  'ufc-fight-night-august-22-2026-f1':
    'Hernandez impose grappling, pression et chaînage au sol — Rodrigues a le power mais doit tenir le tempo du #6 sur 5 rounds après la défaite contre Strickland.',
  'ufc-fight-night-august-22-2026-f2':
    'Petrino combine power et finishing en heavyweight — Spivac reste dangereux au sol mais le Brésilien peut imposer les échanges et toucher tôt.',
  'ufc-fight-night-august-22-2026-f3':
    'De Ridder domine le grappling et le contrôle — Dolidze a le power mais doit éviter le sol pour tenir trois rounds.',
  'ufc-fight-night-august-22-2026-f4':
    'Jones impose volume, boxing et expérience UFC — Mederos progresse vite mais doit contenir le rythme du Gallois.',
  'ufc-fight-night-august-22-2026-f5':
    'Judice part favorite nette sur le striking et l\'expérience — Chaves arrive invaincue mais doit tenir la distance et le volume.',
  'ufc-fight-night-august-22-2026-f6':
    'Gaziev combine power et gabarit — Nzechukwu a l\'athlétisme mais le finish de Shamil bascule le matchup heavyweight.',
  'ufc-fight-night-august-22-2026-f7':
    'McVey arrive avec la dynamique et le profil montant — Schultz reste dangereux mais le tempo du prospect fait pencher la balance.',
  'ufc-fight-night-august-22-2026-f8':
    'Haqparast impose le striking technique et la gestion de distance — Padilla a la pression mais doit toucher proprement pour basculer le combat.',
  'ufc-fight-night-august-22-2026-f9':
    'Young impose wrestling et contrôle — Dorsainvil a le power mais doit tenir les takedowns pour rester dans le combat.',
  'ufc-fight-night-august-22-2026-f10':
    'Douglas arrive en favorite nette avec le tempo et les finitions — Emmers a l\'expérience mais doit éviter les échanges chauds.',
  'ufc-fight-night-august-22-2026-f11':
    'Dyer impose pression et forme récente — Reed a l\'expérience UFC mais le rythme de Shanelle bascule le matchup.',
  'ufc-fight-night-august-22-2026-f12':
    'Barbosa est largement favorite sur le grappling et les finitions — Kuse doit surprendre tôt pour renverser le combat.',
  'ufc-fight-night-august-22-2026-f13':
    'Wint arrive invaincu avec le power heavyweight — Chatman doit imposer le wrestling pour tenir face au finishing.',
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
