import { NextResponse } from 'next/server'
import { getStripe, getSiteUrl, isStripeConfigured } from '@/lib/stripe'
import { getStripePriceId, isPaidPlan } from '@/lib/stripe-plans'
import type { PlanId } from '@/types/subscription'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured', code: 'STRIPE_NOT_CONFIGURED' },
      { status: 503 },
    )
  }

  try {
    const body = (await request.json()) as {
      planId: PlanId
      email?: string
    }

    if (!body.planId || !isPaidPlan(body.planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = getStripePriceId(body.planId)
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Price ID missing for ${body.planId}. Set STRIPE_PRICE_PREMIUM_MONTHLY / STRIPE_PRICE_PREMIUM_ANNUAL.`,
          code: 'MISSING_PRICE_ID',
        },
        { status: 503 },
      )
    }

    const stripe = getStripe()
    const siteUrl = getSiteUrl()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      customer_email: body.email?.trim() || undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: { planId: body.planId },
      subscription_data: {
        metadata: { planId: body.planId },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout session failed' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
