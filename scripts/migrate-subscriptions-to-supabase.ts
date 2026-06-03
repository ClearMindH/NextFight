/**
 * Importe data/subscriptions.json vers Supabase (une fois).
 * Usage: npm run migrate:subscriptions
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { isSupabaseConfigured } from '../lib/supabase/config'
import { upsertSubscription } from '../lib/subscription-store'
import type { SubscriptionRecord } from '../types/subscription'

const PATH = join(process.cwd(), 'data', 'subscriptions.json')

async function main(): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.error('Configurez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local')
    process.exit(1)
  }

  if (!existsSync(PATH)) {
    console.log('Aucun fichier subscriptions.json — rien à migrer.')
    return
  }

  const raw = JSON.parse(readFileSync(PATH, 'utf-8')) as {
    byEmail?: Record<string, SubscriptionRecord>
  }

  const records = Object.values(raw.byEmail ?? {})
  console.log(`Migration de ${records.length} abonnement(s)…`)

  for (const record of records) {
    await upsertSubscription(record)
    console.log(`  ✓ ${record.email}`)
  }

  console.log('\nTerminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
