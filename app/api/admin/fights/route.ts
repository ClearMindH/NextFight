import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-admin'
import { addFightToEvent } from '@/lib/events-store'
import type { FightInput } from '@/types/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = (await request.json()) as FightInput
    if (!body.eventId || !body.id || !body.redId || !body.blueId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    addFightToEvent(body.eventId, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
