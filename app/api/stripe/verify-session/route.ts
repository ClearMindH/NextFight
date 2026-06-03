import { NextResponse } from 'next/server'
import { setCustomerEmailCookie } from '@/lib/auth-cookie'
import { buildSubscriptionStatus } from '@/lib/premium'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { handleCheckoutCompleted } from '@/lib/stripe-webhooks'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })

  if (session.status !== 'complete') {
    return NextResponse.json({ error: 'Session not complete' }, { status: 400 })
  }

  await handleCheckoutCompleted(session, stripe)

  const email =
    session.customer_details?.email?.toLowerCase().trim() ??
    session.customer_email?.toLowerCase().trim() ??
    null

  if (!email) {
    return NextResponse.json({ error: 'No email on session' }, { status: 400 })
  }

  await setCustomerEmailCookie(email)

  return NextResponse.json(await buildSubscriptionStatus(email))
}
