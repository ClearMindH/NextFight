import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-admin'
import { getFighterFromStore } from '@/lib/roster-store'
import { saveFighter } from '@/lib/admin-fighters'
import type { FighterUpsertPayload } from '@/types/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params
  const fighter = getFighterFromStore(id)
  if (!fighter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ fighter })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  try {
    const body = (await request.json()) as FighterUpsertPayload
    const fighter = saveFighter({ ...body, id })
    return NextResponse.json({ fighter })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
