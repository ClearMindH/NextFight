import { NextResponse } from 'next/server'
import { mergeFighterForDisplay } from '@/lib/fighter-display'
import { getFighterFromStore } from '@/lib/roster-store'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const raw = getFighterFromStore(id)
  if (!raw) {
    return NextResponse.json({ error: 'Fighter not found' }, { status: 404 })
  }

  const fighter = mergeFighterForDisplay(raw)
  return NextResponse.json({
    id: fighter.id,
    ranking: fighter.ranking ?? null,
    imageUrl: fighter.imageUrl ?? null,
    name: fighter.name,
    record: fighter.record,
    nickname: fighter.nickname ?? null,
  })
}
