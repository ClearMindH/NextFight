/**
 * Réconcilie l’abonnement Stripe → Supabase pour un email (récupération Apple Pay / Link).
 * Usage: npm run sync:subscription -- email@exemple.com
 */
import { getStripe, isStripeConfigured } from '../lib/stripe'
import { syncSubscriptionsForEmail } from '../lib/stripe-sync'
import { getSubscriptionByEmail, getSubscriptionStorageBackend } from '../lib/subscription-store'
import { buildSubscriptionStatus } from '../lib/premium'

const email = process.argv[2]?.toLowerCase().trim()
if (!email || !email.includes('@')) {
  console.error('Usage: npm run sync:subscription -- email@exemple.com')
  process.exit(1)
}

async function main(): Promise<void> {
  if (!isStripeConfigured()) {
    console.error('STRIPE_SECRET_KEY manquant.')
    process.exit(1)
  }

  console.log(`Stockage : ${getSubscriptionStorageBackend()}`)
  const stripe = getStripe()

  const before = await getSubscriptionByEmail(email)
  console.log('Avant sync:', before?.plan ?? 'aucun', before?.status ?? '—')

  await syncSubscriptionsForEmail(email, stripe)

  const after = await getSubscriptionByEmail(email)
  const status = await buildSubscriptionStatus(email)

  console.log('Après sync:', after?.plan ?? 'aucun', after?.status ?? '—')
  console.log(`Premium actif : ${status.isPremium ? 'oui' : 'non'}`)
  if (status.isPremium && status.currentPeriodEnd) {
    console.log(`Jusqu’au : ${status.currentPeriodEnd}`)
  }
  if (!status.isPremium) {
    console.error(
      'Aucun abonnement actif trouvé dans Stripe pour cet email. Vérifiez l’email Apple Pay / reçu Stripe.',
    )
    process.exit(1)
  }
  console.log('\nDemandez à l’utilisatrice d’aller sur /login avec cet email pour recevoir le lien d’accès.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
