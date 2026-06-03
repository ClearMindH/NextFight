import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-admin'
import { getAllFightersFromStore } from '@/lib/roster-store'
import { saveFighter } from '@/lib/admin-fighters'
import type { FighterUpsertPayload } from '@/types/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  return NextResponse.json({ fighters: getAllFightersFromStore() })
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = (await request.json()) as FighterUpsertPayload
    const fighter = saveFighter(body)
    return NextResponse.json({ fighter })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
