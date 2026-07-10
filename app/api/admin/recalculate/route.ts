import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/api-admin'
import { recalculateAllPredictions } from '@/lib/events-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const denied = await requireAdmin()
  if (denied) return denied

  const result = recalculateAllPredictions()

  revalidatePath('/')
  revalidatePath('/fight/[id]', 'page')
  revalidatePath('/api/events')
  for (const slug of ['ufc'] as const) {
    revalidatePath(`/${slug}-pronostics`)
    revalidatePath(`/${slug}-predictions`)
  }

  return NextResponse.json({
    ok: true,
    message: 'Predictions recalculated on next load',
    ...result,
  })
}
