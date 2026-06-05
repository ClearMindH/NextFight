import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSiteUrl } from '@/lib/site'
import {
  getSubscriptionByEmail,
  setSubscriptionInactive,
} from '@/lib/subscription-store'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.toLowerCase().trim()
  const token = searchParams.get('token')?.trim()

  if (!email || !token) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
  }

  const existing = await getSubscriptionByEmail(email)

  if (existing?.stripeSubscriptionId) {
    try {
      const stripe = getStripe()
      await stripe.subscriptions.cancel(existing.stripeSubscriptionId)
    } catch (err) {
      console.error('[unsubscribe] stripe cancel', err)
    }
  }

  await setSubscriptionInactive(email)

  return NextResponse.redirect(`${getSiteUrl()}/unsubscribed`)
}
