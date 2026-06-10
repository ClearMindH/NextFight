import { NextResponse } from 'next/server'
import { getCustomerEmailFromCookie } from '@/lib/auth-cookie'
import { getStripe, getSiteUrl, isStripeConfigured } from '@/lib/stripe'
import { getSubscriptionByEmail, isManualBillingCustomer } from '@/lib/subscription-store'

export const runtime = 'nodejs'

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const email = await getCustomerEmailFromCookie()
  if (!email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const record = await getSubscriptionByEmail(email)
  if (!record?.stripeCustomerId || isManualBillingCustomer(record)) {
    return NextResponse.json(
      {
        error:
          'Facturation Stripe indisponible pour ce compte. Utilisez « Annuler l’abonnement » ci-dessous.',
      },
      { status: 404 },
    )
  }

  const stripe = getStripe()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: record.stripeCustomerId,
      return_url: `${getSiteUrl()}/account`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe portal]', err)
    return NextResponse.json(
      {
        error:
          'Portail Stripe indisponible. Utilisez « Annuler l’abonnement » ou contactez le support.',
      },
      { status: 502 },
    )
  }
}
