/**
 * Révoque le Premium d'un email (sans Stripe).
 * Usage: npm run revoke:premium -- email@exemple.com
 */
import {
  getSubscriptionByEmail,
  getSubscriptionStorageBackend,
  setSubscriptionInactive,
} from '../lib/subscription-store'

const email = process.argv[2]?.toLowerCase().trim()
if (!email || !email.includes('@')) {
  console.error('Usage: npm run revoke:premium -- email@exemple.com')
  process.exit(1)
}

async function main(): Promise<void> {
  console.log(`Stockage abonnements : ${getSubscriptionStorageBackend()}`)
  const before = await getSubscriptionByEmail(email)
  if (!before) {
    console.log(`Aucun abonnement trouvé pour ${email} (déjà gratuit).`)
    return
  }
  await setSubscriptionInactive(email)
  const after = await getSubscriptionByEmail(email)
  console.log(`Premium révoqué pour ${email}`)
  console.log(`  Avant: ${before.plan} / ${before.status}`)
  console.log(`  Après: ${after?.plan} / ${after?.status}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
