import type { FightMethod, Fighter } from '@/types'
import type { FormMatchupInsight } from '@/types/recent-form'
import type {
  FighterScoreProfile,
  PredictionEngineInput,
  PredictionEngineResult,
  NormalizedFighterFeatures,
} from '@/types/prediction'
import {
  ageScore,
  extractFeatures,
  normalizeFeature,
  relativePhysicalScore,
} from './prediction/features'
import { buildFormProfile, computeFormMatchup } from './prediction/recent-form'
import { prepareFighterForPrediction } from '@/lib/fighter-enrichment'
import { getDataQualityScore, isEventCardStub } from '@/lib/prediction/data-quality'
import {
  reachDeltaAdjustment,
  stylisticDeltaAdjustment,
} from './prediction/matchup-adjustments'
import { blendedWinProbabilities } from './prediction/power-rating'

const WEIGHTS_FULL = {
  striking: 0.24,
  grappling: 0.22,
  physical: 0.09,
  momentum: 0.15,
  schedule: 0.14,
  recentForm: 0.16,
} as const

type ProfileWeights = {
  striking: number
  grappling: number
  physical: number
  momentum: number
  schedule: number
  recentForm: number
}

const WEIGHTS_NO_FORM: ProfileWeights = {
  striking: 0.28,
  grappling: 0.26,
  physical: 0.1,
  momentum: 0.18,
  schedule: 0.16,
  recentForm: 0,
}

const STRIKING_INNER = { accuracy: 0.38, defense: 0.42, volume: 0.2 } as const
const GRAPPLING_INNER = { accuracy: 0.4, defense: 0.4, threat: 0.2 } as const

export class PredictionEngine {
  /**
   * Predict fight outcome from two fighters' statistical profiles.
   * fighterA maps to red corner in UI when used with events data.
   */
  static predict(input: PredictionEngineInput): PredictionEngineResult {
    const rounds = input.scheduledRounds ?? 3
    const fighterA = prepareFighterForPrediction(input.fighterA)
    const fighterB = prepareFighterForPrediction(input.fighterB)

    const featA = extractFeatures(fighterA)
    const featB = extractFeatures(fighterB)

    const formA = buildFormProfile(fighterA)
    const formB = buildFormProfile(fighterB)
    const formMatchup = computeFormMatchup(formA, formB)
    const hasRecentForm = formA.bouts.length > 0 || formB.bouts.length > 0
    const weights: ProfileWeights = hasRecentForm ? { ...WEIGHTS_FULL } : WEIGHTS_NO_FORM

    const profileA = PredictionEngine.buildProfile(
      fighterA,
      featA,
      featB,
      formA.recentFormScore,
      weights,
    )
    const profileB = PredictionEngine.buildProfile(
      fighterB,
      featB,
      featA,
      formB.recentFormScore,
      weights,
    )

    let delta = profileA.compositeScore - profileB.compositeScore
    delta += formMatchup.matchupEdge
    delta += stylisticDeltaAdjustment(featA, featB)
    delta += reachDeltaAdjustment(featA.reachCm, featB.reachCm)

    const heuristic = PredictionEngine.winProbabilities(delta)
    const blended = blendedWinProbabilities(fighterA, fighterB, heuristic.probA)
    const probA = blended.probA
    const probB = blended.probB

    const method = PredictionEngine.predictMethod(
      featA,
      featB,
      profileA,
      profileB,
      delta,
      formMatchup,
    )
    const predictedRound = PredictionEngine.predictRound(
      method,
      featA,
      featB,
      rounds,
      Math.abs(delta),
    )

    const confidence = PredictionEngine.computeConfidence(
      delta,
      featA,
      featB,
      input.fighterA,
      input.fighterB,
      Math.abs(probA - 50),
    )

    const predictedWinnerId =
      probA >= probB ? fighterA.id : fighterB.id

    return {
      fighterAProbability: probA,
      fighterBProbability: probB,
      confidence,
      predictedMethod: method,
      predictedRound,
      predictedWinnerId,
      breakdown: {
        fighterA: profileA,
        fighterB: profileB,
        featureDelta: Math.round(delta * 1000) / 1000,
        form: formMatchup,
      },
    }
  }

  /** Map engine output to legacy Fight.model shape (red = fighterA) */
  static toFightModel(result: PredictionEngineResult) {
    return {
      redWinProbability: result.fighterAProbability,
      predictedMethod: result.predictedMethod,
      predictedRound: result.predictedRound,
      confidence: result.confidence,
      breakdown: {
        red: result.breakdown.fighterA,
        blue: result.breakdown.fighterB,
        form: result.breakdown.form,
      },
    }
  }

  private static buildProfile(
    fighter: Fighter,
    self: NormalizedFighterFeatures,
    opponent: NormalizedFighterFeatures,
    recentFormScore: number,
    weights: ProfileWeights = { ...WEIGHTS_FULL },
  ): FighterScoreProfile {
    const striking = PredictionEngine.strikingScore(self, fighter)
    const grappling = PredictionEngine.grapplingScore(self, fighter)
    const physical = relativePhysicalScore(self, opponent)
    const momentum = PredictionEngine.momentumScore(self)
    const schedule = normalizeFeature(self.strengthOfSchedule, 25, 95)

    const recentForm = Math.min(1, Math.max(0, recentFormScore))

    const compositeScore =
      striking * weights.striking +
      grappling * weights.grappling +
      physical * weights.physical +
      momentum * weights.momentum +
      schedule * weights.schedule +
      recentForm * weights.recentForm

    return {
      compositeScore,
      striking,
      grappling,
      physical,
      momentum,
      schedule,
      recentForm,
    }
  }

  private static strikingScore(
    feat: NormalizedFighterFeatures,
    fighter: Fighter,
  ): number {
    const acc = normalizeFeature(feat.strikeAccuracy, 40, 65)
    const def = normalizeFeature(feat.strikeDefense, 40, 62)
    const volume =
      fighter.stats.slpm != null
        ? normalizeFeature(fighter.stats.slpm, 2.5, 7.5)
        : acc * 0.85

    return (
      acc * STRIKING_INNER.accuracy +
      def * STRIKING_INNER.defense +
      volume * STRIKING_INNER.volume
    )
  }

  private static grapplingScore(
    feat: NormalizedFighterFeatures,
    fighter: Fighter,
  ): number {
    const acc = normalizeFeature(feat.takedownAccuracy, 25, 58)
    const def = normalizeFeature(feat.takedownDefense, 30, 65)
    const threat =
      fighter.stats.subAvg != null
        ? normalizeFeature(fighter.stats.subAvg, 0, 2.5)
        : acc * 0.7

    return (
      acc * GRAPPLING_INNER.accuracy +
      def * GRAPPLING_INNER.defense +
      threat * GRAPPLING_INNER.threat
    )
  }

  private static momentumScore(feat: NormalizedFighterFeatures): number {
    const streak = normalizeFeature(feat.winStreak, 0, 6)
    const age = ageScore(feat.age)
    const finish = normalizeFeature(feat.finishingRate, 15, 85)
    return streak * 0.45 + age * 0.35 + finish * 0.2
  }

  private static winProbabilities(delta: number): { probA: number; probB: number } {
    const k = 4.2
    const rawA = 1 / (1 + Math.exp(-k * delta))
    let probA = Math.round(rawA * 100)
    probA = Math.min(92, Math.max(8, probA))
    const probB = 100 - probA
    return { probA, probB }
  }

  private static predictMethod(
    featA: NormalizedFighterFeatures,
    featB: NormalizedFighterFeatures,
    profileA: FighterScoreProfile,
    profileB: FighterScoreProfile,
    delta: number,
    form: FormMatchupInsight,
  ): FightMethod {
    const grapplingEdge = profileA.grappling - profileB.grappling
    const strikingEdge = profileA.striking - profileB.striking
    const avgFinish =
      (featA.finishingRate +
        featB.finishingRate +
        form.fighterA.finishRateLast5 +
        form.fighterB.finishRateLast5) /
      4

    const favoredForm = delta >= 0 ? form.fighterA : form.fighterB
    const underdogForm = delta >= 0 ? form.fighterB : form.fighterA

    if (Math.abs(delta) < 0.04 && avgFinish < 45) {
      return 'decision'
    }

    const favored = delta >= 0 ? featA : featB
    const favoredGrappling = delta >= 0 ? profileA.grappling : profileB.grappling

    if (
      underdogForm.weaknesses.some((w) => w.includes('KO')) &&
      favoredForm.strengths.some((s) => s.includes('KO') || s.includes('finish'))
    ) {
      return 'ko_tko'
    }

    if (
      underdogForm.weaknesses.some((w) => w.includes('soumission')) &&
      favoredForm.strengths.some((s) => s.includes('soumission'))
    ) {
      return 'submission'
    }

    if (grapplingEdge > 0.12 && favored.takedownAccuracy >= 42 && favoredGrappling > 0.55) {
      return favored.finishingRate > 50 ? 'submission' : 'decision'
    }

    if (strikingEdge > 0.1 && favored.finishingRate >= 48 && favored.strikeAccuracy >= 52) {
      return 'ko_tko'
    }

    if (avgFinish >= 55 && Math.abs(delta) > 0.08) {
      return grapplingEdge > strikingEdge ? 'submission' : 'ko_tko'
    }

    return 'decision'
  }

  private static predictRound(
    method: FightMethod,
    featA: NormalizedFighterFeatures,
    featB: NormalizedFighterFeatures,
    scheduledRounds: number,
    absDelta: number,
  ): number {
    const avgFinish = (featA.finishingRate + featB.finishingRate) / 2
    const finishFactor = normalizeFeature(avgFinish, 20, 80)

    let round: number

    switch (method) {
      case 'ko_tko':
        round = finishFactor > 0.65 ? 1 + Math.round((1 - finishFactor) * 2) : 2
        break
      case 'submission':
        round = finishFactor > 0.55 ? 2 : 3
        break
      case 'decision':
        round =
          scheduledRounds >= 5
            ? absDelta < 0.06
              ? 5
              : 4
            : scheduledRounds === 3
              ? 3
              : 2
        break
      default:
        round = Math.ceil(scheduledRounds / 2)
    }

    return Math.min(scheduledRounds, Math.max(1, round))
  }

  private static computeConfidence(
    delta: number,
    featA: NormalizedFighterFeatures,
    featB: NormalizedFighterFeatures,
    fighterA: Fighter,
    fighterB: Fighter,
    probSeparation: number,
  ): number {
    const separation = Math.min(1, Math.abs(delta) * 2.8)
    let confidence = 50 + separation * 32 + probSeparation * 0.35

    const quality =
      (getDataQualityScore(fighterA) + getDataQualityScore(fighterB)) / 2
    confidence += (quality - 0.5) * 18

    const completeness =
      PredictionEngine.dataCompleteness(fighterA) +
      PredictionEngine.dataCompleteness(fighterB)
    confidence += (completeness / 2 - 0.7) * 10

    const recentA = fighterA.recentBouts?.length ?? 0
    const recentB = fighterB.recentBouts?.length ?? 0
    if (recentA > 0 && recentB > 0) {
      const depth = Math.min(recentA, recentB) / 5
      confidence += 4 * depth
    }

    if (isEventCardStub(fighterA) || isEventCardStub(fighterB)) {
      confidence -= 12
    }

    const stylisticClarity = Math.abs(featA.finishingRate - featB.finishingRate)
    if (stylisticClarity > 20) confidence += 3

    return Math.round(Math.min(92, Math.max(54, confidence)))
  }

  private static dataCompleteness(fighter: Fighter): number {
    const s = fighter.stats
    let score = 0
    let total = 9
    if (s.strikingAccuracy) score++
    if (s.strikeDefense ?? s.strDef) score++
    if (s.takedownAccuracy) score++
    if (s.takedownDefense ?? s.tdDef) score++
    if (s.age) score++
    if (s.heightCm) score++
    if (s.reachCm) score++
    if (s.winStreak != null) score++
    if (s.finishingRate ?? s.subAvg ?? s.slpm) score++
    if (s.strengthOfSchedule ?? fighter.ranking) score++
    return score / total
  }
}

export default PredictionEngine
