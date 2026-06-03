/**
 * Accorde le Premium à un email (sans Stripe).
 * Usage: npm run grant:premium -- email@exemple.com
 * Nécessite Supabase configuré en prod, ou fichier local en dev.
 */
import {
  getSubscriptionStorageBackend,
  upsertSubscription,
} from '../lib/subscription-store'

const email = process.argv[2]?.toLowerCase().trim()
if (!email || !email.includes('@')) {
  console.error('Usage: npm run grant:premium -- email@exemple.com')
  process.exit(1)
}

async function main(): Promise<void> {
  console.log(`Stockage abonnements : ${getSubscriptionStorageBackend()}`)

  const periodEnd = new Date()
  periodEnd.setFullYear(periodEnd.getFullYear() + 1)

  const record = await upsertSubscription({
    email,
    stripeCustomerId: `manual-${Date.now()}`,
    stripeSubscriptionId: null,
    plan: 'premium_annual',
    status: 'active',
    currentPeriodEnd: periodEnd.toISOString(),
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  })

  console.log(`Premium actif pour ${record.email}`)
  console.log(`  Plan: ${record.plan}`)
  console.log(`  Jusqu’au: ${record.currentPeriodEnd}`)
  console.log('\nConnectez-vous sur /login avec cet email (dev local + ADMIN_SECRET).')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
