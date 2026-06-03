import { NextResponse } from 'next/server'
import { getCustomerEmailFromCookie } from '@/lib/auth-cookie'
import { buildSubscriptionStatus } from '@/lib/premium'

export const runtime = 'nodejs'

export async function GET() {
  const email = await getCustomerEmailFromCookie()
  return NextResponse.json(buildSubscriptionStatus(email))
}
