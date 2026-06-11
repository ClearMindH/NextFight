import { NextResponse } from 'next/server'
import { applyCustomerEmailCookie } from '@/lib/auth-cookie'
import { buildSubscriptionStatus } from '@/lib/premium'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import {
  activateSubscriptionFromCheckoutSession,
  resolveEmailFromCompletedSession,
} from '@/lib/stripe-sync'
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

  const hintEmail = resolveEmailFromCompletedSession(session)
  const wasPremiumBefore = hintEmail
    ? isActivePremium(await getSubscriptionByEmail(hintEmail))
    : false

  const email = await activateSubscriptionFromCheckoutSession(session, stripe)

  if (!email) {
    return NextResponse.json(
      { error: 'Impossible de récupérer l’email du paiement (Apple Pay / Link). Contactez le support.' },
      { status: 400 },
    )
  }

  const status = await buildSubscriptionStatus(email)

  if (!status.isPremium) {
    console.error('[verify-session] payment complete but premium inactive', {
      sessionId,
      email,
      plan: status.plan,
      statusCode: status.status,
    })
    return NextResponse.json(
      {
        error:
          'Paiement reçu mais activation en cours. Réessayez dans quelques secondes ou connectez-vous via /login avec votre email de paiement.',
      },
      { status: 503 },
    )
  }

  const response = NextResponse.json({
    ...status,
    magicLinkSent: !wasPremiumBefore,
  })
  return applyCustomerEmailCookie(response, email)
}
