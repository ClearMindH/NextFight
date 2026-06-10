import { NextResponse } from 'next/server'
import { getCustomerEmailFromCookie } from '@/lib/auth-cookie'
import { buildSubscriptionStatus } from '@/lib/premium'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { syncSubscriptionFromStripe } from '@/lib/stripe-webhooks'
import {
  getSubscriptionByEmail,
  isActivePremium,
  isManualBillingCustomer,
  setSubscriptionInactive,
} from '@/lib/subscription-store'

export const runtime = 'nodejs'

type CancelBody = {
  /** Annulation immédiate (sinon : fin de période en cours). */
  immediate?: boolean
}

export async function POST(request: Request) {
  const email = await getCustomerEmailFromCookie()
  if (!email) {
    return NextResponse.json({ error: 'Connectez-vous pour gérer votre abonnement.' }, { status: 401 })
  }

  const record = await getSubscriptionByEmail(email)
  if (!record || !isActivePremium(record)) {
    return NextResponse.json({ error: 'Aucun abonnement Premium actif.' }, { status: 404 })
  }

  if (record.cancelAtPeriodEnd) {
    return NextResponse.json(await buildSubscriptionStatus(email))
  }

  let body: CancelBody = {}
  try {
    body = (await request.json()) as CancelBody
  } catch {
    /* corps vide = annulation en fin de période */
  }

  if (isManualBillingCustomer(record) || !record.stripeSubscriptionId) {
    await setSubscriptionInactive(email)
    return NextResponse.json(await buildSubscriptionStatus(email))
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe n’est pas configuré.' }, { status: 503 })
  }

  const stripe = getStripe()

  try {
    if (body.immediate) {
      await stripe.subscriptions.cancel(record.stripeSubscriptionId)
      await setSubscriptionInactive(email)
    } else {
      const subscription = await stripe.subscriptions.update(record.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      await syncSubscriptionFromStripe(subscription, stripe)
    }
  } catch (err) {
    console.error('[subscription/cancel]', err)
    return NextResponse.json(
      { error: 'Impossible d’annuler l’abonnement. Réessayez ou contactez le support.' },
      { status: 502 },
    )
  }

  return NextResponse.json(await buildSubscriptionStatus(email))
}
