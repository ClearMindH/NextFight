import { NextResponse } from 'next/server'
import { mergeFighterForDisplay } from '@/lib/fighter-display'
import {
  fetchUfcAthleteNickname,
  fetchUfcAthletePortraitUrl,
} from '@/lib/mappers/ufc-athlete-enrichment'
import { getFighterFromStore, upsertFighterInStore } from '@/lib/roster-store'

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

  let fighter = mergeFighterForDisplay(raw)

  if (fighter.organizationId === 'ufc') {
    const slug = fighter.id.replace(/^ufc-/, '')
    if (!fighter.nickname && slug) {
      const nick = await fetchUfcAthleteNickname(slug)
      if (nick) {
        fighter = { ...fighter, nickname: nick }
        try {
          upsertFighterInStore({
            ...raw,
            nickname: nick,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch {
          /* fs read-only (ex. Vercel) */
        }
      }
    }
    if (!fighter.imageUrl && slug) {
      const imageUrl = await fetchUfcAthletePortraitUrl(slug)
      if (imageUrl) {
        fighter = { ...fighter, imageUrl }
        try {
          upsertFighterInStore({
            ...raw,
            imageUrl,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch {
          /* fs read-only */
        }
      }
    }
  }

  return NextResponse.json({
    id: fighter.id,
    ranking: fighter.ranking ?? null,
    imageUrl: fighter.imageUrl ?? null,
    name: fighter.name,
    record: fighter.record,
    nickname: fighter.nickname ?? null,
  })
}
