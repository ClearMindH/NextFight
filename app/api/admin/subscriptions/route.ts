import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-admin'
import {
  adminUpdateSubscription,
  listAllSubscriptions,
  upsertSubscription,
  buildFreeSubscription,
} from '@/lib/subscription-store'
import type { SubscriptionAdminUpdate } from '@/types/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  return NextResponse.json({ subscriptions: listAllSubscriptions() })
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = (await request.json()) as SubscriptionAdminUpdate
    if (!body.email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    let record = adminUpdateSubscription(body.email, {
      plan: body.plan,
      status: body.status,
    })

    if (!record) {
      record = upsertSubscription({
        ...buildFreeSubscription(body.email),
        plan: body.plan,
        status: body.status,
        stripeCustomerId: `manual-${Date.now()}`,
      })
    }

    return NextResponse.json({ subscription: record })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
