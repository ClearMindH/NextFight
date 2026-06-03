import { NextResponse } from 'next/server'
import { getFighterFromStore } from '@/lib/roster-store'
import { getFighterById } from '@/lib/rosters'

function resolveFighter(id: string) {
  return getFighterFromStore(id) ?? getFighterById(id)
}
import { PredictionEngine } from '@/services/PredictionEngine'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fighterAId: string
      fighterBId: string
      scheduledRounds?: number
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

    const result = PredictionEngine.predict({
      fighterA,
      fighterB,
      scheduledRounds: body.scheduledRounds,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
