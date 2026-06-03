import { NextResponse } from 'next/server'
import { loadEventsHydrated } from '@/lib/events-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ events: loadEventsHydrated() })
}
