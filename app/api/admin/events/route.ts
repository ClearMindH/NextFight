import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-admin'
import { loadEventsRaw, upsertEventInput } from '@/lib/events-store'
import type { EventInput } from '@/types/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  return NextResponse.json(loadEventsRaw())
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = (await request.json()) as EventInput
    if (!body.id || !body.name || !body.organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    upsertEventInput({ ...body, fights: body.fights ?? [] })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
