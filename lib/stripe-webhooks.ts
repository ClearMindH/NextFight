import type Stripe from 'stripe'
import {
  getSubscriptionByCustomerId,
  mapStripeSubscriptionStatus,
  resolvePlanFromSubscription,
  upsertSubscription,
  setSubscriptionInactive,
} from '@/lib/subscription-store'
import { isPaidPlan } from '@/lib/stripe-plans'
import type { PlanId } from '@/types/subscription'

function emailFromCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string | null,
): string | null {
  if (!customer || typeof customer === 'string') return null
  if ('deleted' in customer && customer.deleted) return null
  return customer.email?.toLowerCase().trim() ?? null
}

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const end =
    subscription.items.data[0]?.current_period_end ??
    (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

function priceIdFromSubscription(subscription: Stripe.Subscription): string | undefined {
  return subscription.items.data[0]?.price?.id
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  stripe: Stripe,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  let customer =
    typeof subscription.customer === 'string'
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer

  const email =
    emailFromCustomer(customer) ??
    getSubscriptionByCustomerId(customerId)?.email ??
    null

  if (!email) return

  const priceId = priceIdFromSubscription(subscription)
  const planFromMeta = subscription.metadata?.planId as PlanId | undefined
  const plan =
    planFromMeta && isPaidPlan(planFromMeta)
      ? planFromMeta
      : resolvePlanFromSubscription(priceId, 'free')

  const status = mapStripeSubscriptionStatus(subscription.status)
  const isPremiumActive = status === 'active' || status === 'trialing'

  upsertSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: isPremiumActive && isPaidPlan(plan) ? plan : 'free',
    status,
    currentPeriodEnd: periodEndIso(subscription),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  })
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<void> {
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id

  const email =
    session.customer_details?.email?.toLowerCase().trim() ??
    session.customer_email?.toLowerCase().trim() ??
    null

  if (!email || !customerId) return

  if (session.subscription) {
    const subId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id
    const subscription = await stripe.subscriptions.retrieve(subId)
    await syncSubscriptionFromStripe(subscription, stripe)
    return
  }

  const planId = (session.metadata?.planId as PlanId) ?? 'premium_monthly'

  upsertSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: null,
    plan: isPaidPlan(planId) ? planId : 'free',
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  })
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const existing = getSubscriptionByCustomerId(customerId)
  if (existing) setSubscriptionInactive(existing.email)
}
