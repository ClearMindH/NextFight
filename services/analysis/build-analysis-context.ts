import type { Fighter } from '@/types'
import type { PredictionEngineResult } from '@/types/prediction'

export interface AnalysisContextPayload {
  weightClass?: string
  eventName?: string
  scheduledRounds: number
  fighterA: ReturnType<typeof serializeFighter>
  fighterB: ReturnType<typeof serializeFighter>
  /** Fixed outputs from PredictionEngine — do not recalculate */
  statisticalModel: {
    favoriteFighterName: string
    underdogFighterName: string
    fighterAWinPercent: number
    fighterBWinPercent: number
    confidencePercent: number
    dimensionEdge: {
      striking: 'A' | 'B' | 'even'
      grappling: 'A' | 'B' | 'even'
      physical: 'A' | 'B' | 'even'
      momentum: 'A' | 'B' | 'even'
      schedule: 'A' | 'B' | 'even'
    }
  }
}

function serializeFighter(fighter: Fighter, label: 'A' | 'B') {
  const s = fighter.stats
  return {
    label,
    id: fighter.id,
    name: fighter.name,
    record: fighter.record,
    ranking: fighter.ranking ?? null,
    weightClass: fighter.weightClass ?? null,
    stats: {
      strikeAccuracy: s.strikingAccuracy,
      strikeDefense: s.strikeDefense ?? s.strDef ?? null,
      takedownAccuracy: s.takedownAccuracy,
      takedownDefense: s.takedownDefense ?? s.tdDef ?? null,
      reachCm: s.reachCm,
      heightCm: s.heightCm,
      age: s.age,
      winStreak: s.winStreak,
      finishingRate: s.finishingRate ?? null,
      strengthOfSchedule: s.strengthOfSchedule ?? null,
      slpm: s.slpm ?? null,
      subAvg: s.subAvg ?? null,
    },
  }
}

function edge(
  a: number,
  b: number,
  threshold = 0.04,
): 'A' | 'B' | 'even' {
  if (Math.abs(a - b) < threshold) return 'even'
  return a > b ? 'A' : 'B'
}

export function buildAnalysisContext(
  fighterA: Fighter,
  fighterB: Fighter,
  prediction: PredictionEngineResult,
  meta?: { weightClass?: string; eventName?: string; scheduledRounds?: number },
): AnalysisContextPayload {
  const favoriteIsA = prediction.fighterAProbability >= prediction.fighterBProbability
  const favoriteName = favoriteIsA ? fighterA.name : fighterB.name
  const underdogName = favoriteIsA ? fighterB.name : fighterA.name
  const { fighterA: profileA, fighterB: profileB } = prediction.breakdown

  return {
    weightClass: meta?.weightClass,
    eventName: meta?.eventName,
    scheduledRounds: meta?.scheduledRounds ?? 3,
    fighterA: serializeFighter(fighterA, 'A'),
    fighterB: serializeFighter(fighterB, 'B'),
    statisticalModel: {
      favoriteFighterName: favoriteName,
      underdogFighterName: underdogName,
      fighterAWinPercent: prediction.fighterAProbability,
      fighterBWinPercent: prediction.fighterBProbability,
      confidencePercent: prediction.confidence,
      dimensionEdge: {
        striking: edge(profileA.striking, profileB.striking),
        grappling: edge(profileA.grappling, profileB.grappling),
        physical: edge(profileA.physical, profileB.physical),
        momentum: edge(profileA.momentum, profileB.momentum),
        schedule: edge(profileA.schedule, profileB.schedule),
      },
    },
  }
}

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert MMA analyst writing editorial content for NextFight.

STRICT RULES:
1. NEVER calculate, estimate, invent, or adjust win probabilities, odds, or percentages.
2. All win probabilities and confidence values are pre-computed by a separate statistical engine — reference them only as given facts when useful for narrative context.
3. Do not contradict the statistical model's predicted winner.
4. NEVER predict, state, or imply how the fight ends (method or round): no KO/TKO, submission, or decision calls, and no round predictions.
5. Base strengths, weaknesses, and fight keys on the fighter statistics and stylistic matchup — not on your own probability math.
6. Write in clear, professional English. Be specific and tactical.
7. Return ONLY valid JSON with no markdown fences.

JSON schema:
{
  "analysis": "string (2-4 paragraphs, fight preview)",
  "redCorner": { "strengths": ["string", ...], "weaknesses": ["string", ...] },
  "blueCorner": { "strengths": ["string", ...], "weaknesses": ["string", ...] },
  "fightKeys": ["string", ...]
}

Each strengths/weaknesses array: 3-5 concise bullet points.
fightKeys: 4-6 decisive factors for how the fight may play out.`

export function buildAnalysisUserPrompt(
  context: AnalysisContextPayload,
  redName: string,
  blueName: string,
): string {
  return `Generate narrative analysis for this matchup.

Red corner: ${redName}
Blue corner: ${blueName}

Use "redCorner" for ${redName} and "blueCorner" for ${blueName} in the JSON keys.

Context (JSON):
${JSON.stringify(context, null, 2)}`
}
