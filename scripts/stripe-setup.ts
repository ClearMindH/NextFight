/**
 * Creates NextFight products & prices in Stripe (EUR).
 * Run: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts
 */
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Set STRIPE_SECRET_KEY')
    process.exit(1)
  }

  const product = await stripe.products.create({
    name: 'NextFight Premium',
    description: 'Toutes les prédictions, analyses détaillées, historique, comparateur avancé',
    metadata: { app: 'nextfight' },
  })

  const monthly = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 999,
    recurring: { interval: 'month' },
    metadata: { planId: 'premium_monthly' },
  })

  const annual = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 7999,
    recurring: { interval: 'year' },
    metadata: { planId: 'premium_annual' },
  })

  console.log('\nAdd to .env.local:\n')
  console.log(`STRIPE_PRICE_PREMIUM_MONTHLY=${monthly.id}`)
  console.log(`STRIPE_PRICE_PREMIUM_ANNUAL=${annual.id}`)
  console.log('\nWebhook endpoint: /api/webhooks/stripe')
  console.log('Events: checkout.session.completed, customer.subscription.*, invoice.payment_failed\n')
}

main().catch(console.error)
