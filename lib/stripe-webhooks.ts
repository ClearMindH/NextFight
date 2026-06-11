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
import { sendWelcomeSubscriptionEmail } from '@/lib/email'
import {
  ensureStripeCustomerEmail,
  resolveEmailFromCompletedSession,
  resolveStripeCustomerEmail,
} from '@/lib/stripe-sync'

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
  hintEmail?: string | null,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  let customer =
    typeof subscription.customer === 'string'
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer

  const existingByCustomer = await getSubscriptionByCustomerId(customerId)
  const email = await resolveStripeCustomerEmail(
    stripe,
    customerId,
    customer,
    hintEmail ?? existingByCustomer?.email ?? null,
  )

  if (!email) {
    console.error('[stripe] syncSubscription: no email for customer', customerId)
    return
  }

  await ensureStripeCustomerEmail(stripe, customerId, email)

  const priceId = priceIdFromSubscription(subscription)
  const planFromMeta = subscription.metadata?.planId as PlanId | undefined
  const resolvedPlan =
    planFromMeta && isPaidPlan(planFromMeta)
      ? planFromMeta
      : resolvePlanFromSubscription(priceId, 'free')

  const status = mapStripeSubscriptionStatus(subscription.status)
  const isPremiumActive = status === 'active' || status === 'trialing'

  const wasPremium = existingByCustomer?.status === 'active' || existingByCustomer?.status === 'trialing'
  const recordPlan = isPremiumActive
    ? isPaidPlan(resolvedPlan)
      ? resolvedPlan
      : 'premium_monthly'
    : 'free'

  await upsertSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: recordPlan,
    status,
    currentPeriodEnd: periodEndIso(subscription),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  })

  if (isPremiumActive && isPaidPlan(recordPlan) && !wasPremium) {
    void sendWelcomeSubscriptionEmail(email, recordPlan)
  }
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<void> {
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id

  const customerObject =
    session.customer && typeof session.customer !== 'string' ? session.customer : null

  let resolvedEmail = resolveEmailFromCompletedSession(session)

  if (!customerId) {
    console.error('[stripe] checkout.session.completed: missing customer', session.id)
    return
  }

  if (!resolvedEmail) {
    resolvedEmail = await resolveStripeCustomerEmail(
      stripe,
      customerId,
      customerObject,
      null,
    )
    if (!resolvedEmail) {
      console.error('[stripe] checkout.session.completed: missing email', session.id)
      return
    }
  }

  await ensureStripeCustomerEmail(stripe, customerId, resolvedEmail)

  if (session.subscription) {
    const subscription =
      typeof session.subscription === 'string'
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription
    await syncSubscriptionFromStripe(subscription, stripe, resolvedEmail)
    return
  }

  const planId = (session.metadata?.planId as PlanId) ?? 'premium_monthly'

  await upsertSubscription({
    email: resolvedEmail,
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

  const existing = await getSubscriptionByCustomerId(customerId)
  if (existing) await setSubscriptionInactive(existing.email)
}
