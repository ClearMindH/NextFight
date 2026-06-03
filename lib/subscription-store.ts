import { isSupabaseConfigured } from '@/lib/supabase/config'
import {
  fileGetByCustomerId,
  fileGetByEmail,
  fileListAll,
  fileUpsert,
} from '@/lib/subscriptions/file-store'
import {
  supabaseGetByCustomerId,
  supabaseGetByEmail,
  supabaseListAll,
  supabaseUpsert,
} from '@/lib/subscriptions/supabase-store'
import type { PlanId, SubscriptionRecord, SubscriptionStatus } from '@/types/subscription'
import { isPaidPlan } from '@/lib/stripe-plans'

function useSupabase(): boolean {
  return isSupabaseConfigured()
}

export async function getSubscriptionByEmail(
  email: string,
): Promise<SubscriptionRecord | null> {
  if (useSupabase()) return supabaseGetByEmail(email)
  return fileGetByEmail(email)
}

export async function getSubscriptionByCustomerId(
  customerId: string,
): Promise<SubscriptionRecord | null> {
  if (useSupabase()) return supabaseGetByCustomerId(customerId)
  return fileGetByCustomerId(customerId)
}

export async function upsertSubscription(
  record: SubscriptionRecord,
): Promise<SubscriptionRecord> {
  if (useSupabase()) return supabaseUpsert(record)
  return fileUpsert(record)
}

export async function setSubscriptionInactive(email: string): Promise<void> {
  const existing = await getSubscriptionByEmail(email)
  if (!existing) return
  await upsertSubscription({
    ...existing,
    plan: 'free',
    status: 'inactive',
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  })
}

export function isActivePremium(record: SubscriptionRecord | null): boolean {
  if (!record) return false
  if (!isPaidPlan(record.plan)) return false
  return record.status === 'active' || record.status === 'trialing'
}

export function buildFreeSubscription(email: string): SubscriptionRecord {
  return {
    email: email.toLowerCase().trim(),
    stripeCustomerId: '',
    stripeSubscriptionId: null,
    plan: 'free',
    status: 'inactive',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  }
}

export function mapStripeSubscriptionStatus(
  status: string,
): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
      return status
    default:
      return 'inactive'
  }
}

export async function listAllSubscriptions(): Promise<SubscriptionRecord[]> {
  if (useSupabase()) return supabaseListAll()
  return fileListAll()
}

export async function adminUpdateSubscription(
  email: string,
  updates: Partial<Pick<SubscriptionRecord, 'plan' | 'status' | 'currentPeriodEnd'>>,
): Promise<SubscriptionRecord | null> {
  const existing = await getSubscriptionByEmail(email)
  if (!existing) return null
  return upsertSubscription({
    ...existing,
    ...updates,
    email: email.toLowerCase().trim(),
  })
}

export function resolvePlanFromSubscription(
  priceId: string | undefined,
  fallback: PlanId = 'free',
): PlanId {
  if (!priceId) return fallback
  const monthly = process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim()
  const annual = process.env.STRIPE_PRICE_PREMIUM_ANNUAL?.trim()
  if (priceId === monthly) return 'premium_monthly'
  if (priceId === annual) return 'premium_annual'
  return fallback
}

/** Indique si la prod doit utiliser Supabase (recommandé dès le déploiement). */
export function getSubscriptionStorageBackend(): 'supabase' | 'file' {
  return useSupabase() ? 'supabase' : 'file'
}
