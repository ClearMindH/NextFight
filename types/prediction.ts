import type { FightMethod } from './index'
import type { Fighter } from './index'

export interface PredictionEngineInput {
  fighterA: Fighter
  fighterB: Fighter
  scheduledRounds?: number
}

export interface PredictionEngineResult {
  /** Win probability for fighterA (0–100) */
  fighterAProbability: number
  /** Win probability for fighterB (0–100) */
  fighterBProbability: number
  /** Model confidence (0–100) */
  confidence: number
  predictedMethod: FightMethod
  predictedRound: number
  /** Predicted winner id (fighterA or fighterB) */
  predictedWinnerId: string
  /** Per-dimension breakdown for analytics UI */
  breakdown: PredictionBreakdown
}

import type { FormMatchupInsight } from './recent-form'

export interface PredictionBreakdown {
  fighterA: FighterScoreProfile
  fighterB: FighterScoreProfile
  featureDelta: number
  form?: FormMatchupInsight
}

export interface FighterScoreProfile {
  compositeScore: number
  striking: number
  grappling: number
  physical: number
  momentum: number
  schedule: number
  /** Forme sur les 5 derniers combats */
  recentForm: number
}

export interface NormalizedFighterFeatures {
  strikeAccuracy: number
  strikeDefense: number
  takedownAccuracy: number
  takedownDefense: number
  age: number
  heightCm: number
  reachCm: number
  winStreak: number
  finishingRate: number
  strengthOfSchedule: number
}
