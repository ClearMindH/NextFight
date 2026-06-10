import type { FighterScoreProfile } from './prediction'
import type { FighterRecentBout } from './recent-form'

export type { FighterRecentBout, FighterFormProfile, FormMatchupInsight } from './recent-form'

export type OrganizationId = 'ufc' | 'pfl' | 'ksw' | 'ares' | 'hexagone'

export type FightMethod = 'ko_tko' | 'submission' | 'decision' | 'draw'

export interface Organization {
  id: OrganizationId
  name: string
  fullName: string
  slug: string
  seoPath: string
  /** French pronostics path (e.g. /ufc-pronostics) */
  seoPathFr: string
  description: string
  descriptionFr: string
}

export interface FighterStats {
  strikingAccuracy: number
  /** Opponent strike avoidance — alias legacy: strDef */
  strikeDefense?: number
  takedownAccuracy: number
  /** Takedown defense % — alias legacy: tdDef */
  takedownDefense?: number
  reachCm: number
  heightCm: number
  age: number
  winStreak: number
  /** Finish rate (KO/sub wins ÷ total wins), 0–100 */
  finishingRate?: number
  /** Quality of opposition faced, 0–100 */
  strengthOfSchedule?: number
  slpm?: number
  sapm?: number
  /** @deprecated use strikeDefense */
  strDef?: number
  tdAvg?: number
  /** @deprecated use takedownDefense */
  tdDef?: number
  subAvg?: number
}

export interface Fighter {
  id: string
  organizationId: OrganizationId
  name: string
  nickname?: string
  record: string
  wins: number
  losses: number
  draws: number
  country: string
  weightClass?: string
  ranking?: number
  stance?: string
  imageUrl?: string
  stats: FighterStats
  /** 5 derniers combats (synthétisés ou issus d'une sync future) */
  recentBouts?: FighterRecentBout[]
  /** Profil méthodes issu de Sherdog / Tapology (optionnel) */
  externalMethodCounts?: {
    koWins: number
    subWins: number
    decWins: number
    koLosses: number
    subLosses: number
    decLosses: number
    wins: number
    losses: number
    source?: string
  }
  lastSyncedAt: string
  source: 'ufc-api' | 'roster-seed' | 'merged' | 'event-card' | 'ufc.com'
}

/** Pronostic figé au moment où la carte est verrouillée, pour un bilan honnête. */
export interface PredictionSnapshot {
  predictedWinnerId: string
  redWinProbability: number
  confidence: number
  /** ISO date de capture du pronostic. */
  capturedAt: string
}

/** Résultat réel d'un combat. Méthode/round stockés mais non affichés. */
export interface FightResult {
  /** Vainqueur réel ; null = nul / no contest. */
  winnerId: string | null
  method?: FightMethod
  round?: number
  /** Origine de la donnée (ex. 'recent-bouts', 'manual'). */
  source?: string
}

export interface Fight {
  id: string
  eventId: string
  order: number
  weightClass: string
  isTitle: boolean
  isMainEvent: boolean
  scheduledRounds: number
  redCorner: Fighter
  blueCorner: Fighter
  model: {
    redWinProbability: number
    predictedMethod: FightMethod
    predictedRound: number
    confidence: number
    /** Probabilité rouge avant blend marché / override (hydratation). */
    rawRedWinProbability?: number
    /** Note affichée quand le pronostic final diffère du modèle brut ou du marché. */
    adjustmentNote?: string
    breakdown?: {
      red: FighterScoreProfile
      blue: FighterScoreProfile
      form?: import('./recent-form').FormMatchupInsight
    }
  }
  /** Pronostic figé (événements verrouillés ou passés). */
  predictionSnapshot?: PredictionSnapshot
  /** Résultat réel (événements terminés). */
  result?: FightResult
}

export interface Event {
  id: string
  organizationId: OrganizationId
  name: string
  date: string
  venue: string
  city: string
  country: string
  status: 'upcoming' | 'live' | 'completed'
  /** Si absent : règle auto (voir lib/event-predictions.ts). */
  predictionsStatus?: 'published' | 'preparing'
  fights: Fight[]
  /** Compteur communauté — optionnel ; non affiché tant qu’il n’y a pas de vraies données. */
  communityPredictions?: number
}

export interface Prediction {
  fightId: string
  eventId: string
  organizationId: OrganizationId
  winnerId: string
  method: FightMethod
  round?: number
  confidence: number
  createdAt: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  rating: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface PricingPlan {
  id: string
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export interface RosterMeta {
  organizationId: OrganizationId
  fighterCount: number
  lastSyncedAt: string
  source: string
}

export interface OrganizationRoster {
  meta: RosterMeta
  fighters: Fighter[]
}
