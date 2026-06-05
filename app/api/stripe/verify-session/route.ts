import { NextResponse } from 'next/server'
import { setCustomerEmailCookie } from '@/lib/auth-cookie'
import { sendWelcomeSubscriptionEmail } from '@/lib/email'
import { buildSubscriptionStatus } from '@/lib/premium'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { handleCheckoutCompleted } from '@/lib/stripe-webhooks'
import { getSubscriptionByEmail, isActivePremium } from '@/lib/subscription-store'

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

  const email =
    session.customer_details?.email?.toLowerCase().trim() ??
    session.customer_email?.toLowerCase().trim() ??
    null

  if (!email) {
    return NextResponse.json({ error: 'No email on session' }, { status: 400 })
  }

  const existingBefore = await getSubscriptionByEmail(email)
  const wasPremiumBefore = isActivePremium(existingBefore)

  await handleCheckoutCompleted(session, stripe)

  const status = await buildSubscriptionStatus(email)

  if (status.isPremium && !wasPremiumBefore) {
    const mail = await sendWelcomeSubscriptionEmail(email, status.plan)
    if (!mail.sent) {
      console.error('[verify-session] welcome email failed:', mail.error)
    }
  }

  await setCustomerEmailCookie(email)

  return NextResponse.json(status)
}
