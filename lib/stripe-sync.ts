import type Stripe from 'stripe'
import { syncSubscriptionFromStripe } from '@/lib/stripe-webhooks'

export function emailFromStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string | null | undefined,
): string | null {
  if (!customer || typeof customer === 'string') return null
  if ('deleted' in customer && customer.deleted) return null
  return customer.email?.toLowerCase().trim() ?? null
}

export function emailFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  return (
    session.customer_details?.email?.toLowerCase().trim() ??
    session.customer_email?.toLowerCase().trim() ??
    null
  )
}

/** Email après paiement — Apple Pay / Link mettent souvent l’email sur le Customer expandé. */
export function resolveEmailFromCompletedSession(
  session: Stripe.Checkout.Session,
): string | null {
  const fromSession = emailFromCheckoutSession(session)
  if (fromSession) return fromSession

  const customer = session.customer
  if (customer && typeof customer !== 'string') {
    return emailFromStripeCustomer(customer)
  }

  return null
}

/** Dernière session Checkout complétée pour récupérer l’email (Apple Pay / Link). */
export async function emailFromRecentCheckoutSession(
  stripe: Stripe,
  customerId: string,
): Promise<string | null> {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'complete',
    limit: 5,
  })

  for (const session of sessions.data) {
    const email = emailFromCheckoutSession(session)
    if (email) return email
  }

  return null
}

export async function resolveStripeCustomerEmail(
  stripe: Stripe,
  customerId: string,
  customer?: Stripe.Customer | Stripe.DeletedCustomer | null,
  hintEmail?: string | null,
): Promise<string | null> {
  const fromCustomer = emailFromStripeCustomer(customer)
  if (fromCustomer) return fromCustomer
  if (hintEmail) return hintEmail.toLowerCase().trim()
  return emailFromRecentCheckoutSession(stripe, customerId)
}

export async function ensureStripeCustomerEmail(
  stripe: Stripe,
  customerId: string,
  email: string,
): Promise<void> {
  const normalized = email.toLowerCase().trim()
  if (!normalized) return

  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (emailFromStripeCustomer(customer)) return
    await stripe.customers.update(customerId, { email: normalized })
  } catch (err) {
    console.error('[stripe-sync] ensureStripeCustomerEmail', customerId, err)
  }
}

/** Active l’abonnement immédiatement après Checkout (carte, Link, Apple Pay). */
export async function activateSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<string | null> {
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id

  if (!customerId) return null

  const customerObject =
    session.customer && typeof session.customer !== 'string' ? session.customer : null

  let email = resolveEmailFromCompletedSession(session)
  if (!email) {
    email = await resolveStripeCustomerEmail(stripe, customerId, customerObject, null)
  }
  if (!email) return null

  const { handleCheckoutCompleted } = await import('@/lib/stripe-webhooks')
  await handleCheckoutCompleted(session, stripe)
  await syncSubscriptionsForEmail(email, stripe)

  return email
}

/** Réconcilie Supabase/fichier local avec les abonnements actifs Stripe pour cet email. */
export async function syncSubscriptionsForEmail(
  email: string,
  stripe: Stripe,
): Promise<void> {
  const normalized = email.toLowerCase().trim()
  if (!normalized.includes('@')) return

  const customers = await stripe.customers.list({ email: normalized, limit: 10 })

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    })

    for (const subscription of subscriptions.data) {
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await syncSubscriptionFromStripe(subscription, stripe)
      }
    }
  }
}
