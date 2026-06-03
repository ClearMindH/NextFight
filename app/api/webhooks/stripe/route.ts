import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import {
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  syncSubscriptionFromStripe,
} from '@/lib/stripe-webhooks'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          stripe,
        )
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await syncSubscriptionFromStripe(
          event.data.object as Stripe.Subscription,
          stripe,
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subRef = invoice.parent?.subscription_details?.subscription
        const subId = typeof subRef === 'string' ? subRef : subRef?.id
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId)
          await syncSubscriptionFromStripe(subscription, stripe)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[stripe webhook]', event.type, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
