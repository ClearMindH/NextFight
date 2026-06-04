import type { NormalizedFighterFeatures } from '@/types/prediction'

/** Ajustement léger du delta composite selon le style (striker vs grappler). */
export function stylisticDeltaAdjustment(
  featA: NormalizedFighterFeatures,
  featB: NormalizedFighterFeatures,
): number {
  const styleA = featA.takedownAccuracy * 0.4 + featA.finishingRate * 0.35 + featA.strikeAccuracy * 0.25
  const styleB = featB.takedownAccuracy * 0.4 + featB.finishingRate * 0.35 + featB.strikeAccuracy * 0.25

  const grapA = featA.takedownAccuracy >= 48 && featA.takedownDefense >= 58
  const grapB = featB.takedownAccuracy >= 48 && featB.takedownDefense >= 58
  const strikeA = featA.strikeAccuracy >= 54 && featA.finishingRate >= 50
  const strikeB = featB.strikeAccuracy >= 54 && featB.finishingRate >= 50

  let adj = (styleA - styleB) * 0.0015

  if (grapA && strikeB) adj += 0.025
  if (grapB && strikeA) adj -= 0.025
  if (strikeA && grapB && featA.finishingRate > featB.strikeDefense * 0.85) adj += 0.015
  if (strikeB && grapA && featB.finishingRate > featA.strikeDefense * 0.85) adj -= 0.015

  return Math.max(-0.06, Math.min(0.06, adj))
}

const DEFAULT_REACH_CM = 183

export function reachDeltaAdjustment(
  reachA: number | undefined,
  reachB: number | undefined,
): number {
  const diffCm = (reachA ?? DEFAULT_REACH_CM) - (reachB ?? DEFAULT_REACH_CM)
  if (Math.abs(diffCm) < 5) return 0
  return Math.max(-0.03, Math.min(0.03, diffCm * 0.002))
}
