import { NextResponse } from 'next/server'
import { getCustomerEmailFromCookie } from '@/lib/auth-cookie'
import { getStripe, getSiteUrl, isStripeConfigured } from '@/lib/stripe'
import { getSubscriptionByEmail } from '@/lib/subscription-store'

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
  if (!record?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: record.stripeCustomerId,
    return_url: `${getSiteUrl()}/account`,
  })

  return NextResponse.json({ url: session.url })
}
