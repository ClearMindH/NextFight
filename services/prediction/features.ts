import type { Fighter } from '@/types'
import type { NormalizedFighterFeatures } from '@/types/prediction'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function pct(value: number | undefined, fallback: number): number {
  return clamp(value ?? fallback, 0, 100)
}

/** Estimate finish rate when not stored explicitly */
export function estimateFinishingRate(fighter: Fighter): number {
  if (fighter.stats.finishingRate != null) return fighter.stats.finishingRate

  const total = fighter.wins + fighter.losses + fighter.draws
  const winRate = total > 0 ? fighter.wins / total : 0.5
  const subFactor = (fighter.stats.subAvg ?? 0) * 8
  const powerFactor = fighter.stats.slpm != null && fighter.stats.slpm > 5 ? 8 : 0

  return clamp(Math.round(28 + winRate * 35 + subFactor + powerFactor), 15, 85)
}

/** Estimate strength of schedule from ranking + experience */
export function estimateStrengthOfSchedule(fighter: Fighter): number {
  if (fighter.stats.strengthOfSchedule != null) return fighter.stats.strengthOfSchedule

  const fights = fighter.wins + fighter.losses
  const experience = clamp(fights / 30, 0, 1) * 25
  const rankingBoost =
    fighter.ranking != null ? clamp(100 - (fighter.ranking - 1) * 8, 35, 95) : 50

  return clamp(Math.round(rankingBoost * 0.6 + experience + 15), 25, 95)
}

export function extractFeatures(fighter: Fighter): NormalizedFighterFeatures {
  const strikeDefense = pct(
    fighter.stats.strikeDefense ?? fighter.stats.strDef,
    52,
  )
  const takedownDefense = pct(
    fighter.stats.takedownDefense ?? fighter.stats.tdDef,
    38,
  )

  return {
    strikeAccuracy: pct(fighter.stats.strikingAccuracy, 50),
    strikeDefense,
    takedownAccuracy: pct(fighter.stats.takedownAccuracy, 38),
    takedownDefense,
    age: fighter.stats.age,
    heightCm: fighter.stats.heightCm,
    reachCm: fighter.stats.reachCm,
    winStreak: fighter.stats.winStreak,
    finishingRate: estimateFinishingRate(fighter),
    strengthOfSchedule: estimateStrengthOfSchedule(fighter),
  }
}

export function normalizeFeature(value: number, min: number, max: number): number {
  if (max <= min) return 0.5
  return clamp((value - min) / (max - min), 0, 1)
}

const DEFAULT_AGE = 29
const DEFAULT_REACH_CM = 183
const DEFAULT_HEIGHT_CM = 178

/** Younger fighters score higher (prime ~26–32) */
export function ageScore(age: number | undefined, fallback = DEFAULT_AGE): number {
  const a = age ?? fallback
  if (a <= 26) return 0.55 + (26 - a) * 0.01
  if (a <= 32) return 1
  return clamp(1 - (a - 32) * 0.04, 0.35, 1)
}

export function relativePhysicalScore(
  self: NormalizedFighterFeatures,
  opponent: NormalizedFighterFeatures,
): number {
  const reachAdv =
    (self.reachCm ?? DEFAULT_REACH_CM) - (opponent.reachCm ?? DEFAULT_REACH_CM)
  const heightAdv =
    (self.heightCm ?? DEFAULT_HEIGHT_CM) - (opponent.heightCm ?? DEFAULT_HEIGHT_CM)
  return clamp(0.5 + (reachAdv / 25) * 0.25 + (heightAdv / 20) * 0.15, 0, 1)
}
