import { NextResponse } from 'next/server'
import { getFighterFromStore } from '@/lib/roster-store'
import { getFighterById } from '@/lib/rosters'

function resolveFighter(id: string) {
  return getFighterFromStore(id) ?? getFighterById(id)
}
import { PredictionEngine } from '@/services/PredictionEngine'
import {
  OpenAIAnalysisError,
  OpenAIAnalysisService,
} from '@/services/OpenAIAnalysisService'
import type { FightAnalysisResponse } from '@/types/analysis'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!OpenAIAnalysisService.isConfigured()) {
      return NextResponse.json(
        {
          error: 'Analyse détaillée temporairement indisponible.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 },
      )
    }

    const body = (await request.json()) as {
      fighterAId: string
      fighterBId: string
      scheduledRounds?: number
      weightClass?: string
      eventName?: string
    }

    if (!body.fighterAId || !body.fighterBId) {
      return NextResponse.json(
        { error: 'fighterAId and fighterBId are required' },
        { status: 400 },
      )
    }

    const fighterA = resolveFighter(body.fighterAId)
    const fighterB = resolveFighter(body.fighterBId)

    if (!fighterA || !fighterB) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 })
    }

    const prediction = PredictionEngine.predict({
      fighterA,
      fighterB,
      scheduledRounds: body.scheduledRounds,
    })

    const narrative = await OpenAIAnalysisService.generateNarrative({
      fighterA,
      fighterB,
      prediction,
      scheduledRounds: body.scheduledRounds,
      weightClass: body.weightClass,
      eventName: body.eventName,
    })

    const response: FightAnalysisResponse = {
      prediction: {
        fighterAProbability: prediction.fighterAProbability,
        fighterBProbability: prediction.fighterBProbability,
        confidence: prediction.confidence,
        predictedMethod: prediction.predictedMethod,
        predictedRound: prediction.predictedRound,
        predictedWinnerId: prediction.predictedWinnerId,
      },
      narrative,
    }

    return NextResponse.json(response)
  } catch (err) {
    if (err instanceof OpenAIAnalysisError) {
      const status = err.code === 'MISSING_API_KEY' ? 503 : 502
      return NextResponse.json({ error: err.message, code: err.code }, { status })
    }

    return NextResponse.json(
      { error: 'Failed to generate fight analysis' },
      { status: 500 },
    )
  }
}
