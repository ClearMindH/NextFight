import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import type { PlanId, SubscriptionRecord, SubscriptionStatus } from '@/types/subscription'
import { isPaidPlan } from '@/lib/stripe-plans'

const STORE_PATH = path.join(process.cwd(), 'data', 'subscriptions.json')

interface SubscriptionStore {
  byEmail: Record<string, SubscriptionRecord>
  byCustomerId: Record<string, string>
}

function emptyStore(): SubscriptionStore {
  return { byEmail: {}, byCustomerId: {} }
}

function readStore(): SubscriptionStore {
  try {
    if (!existsSync(STORE_PATH)) return emptyStore()
    const raw = readFileSync(STORE_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as SubscriptionStore
    return {
      byEmail: parsed.byEmail ?? {},
      byCustomerId: parsed.byCustomerId ?? {},
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: SubscriptionStore): void {
  const dir = path.dirname(STORE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

export function getSubscriptionByEmail(email: string): SubscriptionRecord | null {
  const normalized = email.toLowerCase().trim()
  const store = readStore()
  return store.byEmail[normalized] ?? null
}

export function getSubscriptionByCustomerId(
  customerId: string,
): SubscriptionRecord | null {
  const store = readStore()
  const email = store.byCustomerId[customerId]
  if (!email) return null
  return store.byEmail[email] ?? null
}

export function upsertSubscription(record: SubscriptionRecord): SubscriptionRecord {
  const store = readStore()
  const email = record.email.toLowerCase().trim()
  const next: SubscriptionRecord = {
    ...record,
    email,
    updatedAt: new Date().toISOString(),
  }
  store.byEmail[email] = next
  store.byCustomerId[record.stripeCustomerId] = email
  writeStore(store)
  return next
}

export function setSubscriptionInactive(email: string): void {
  const existing = getSubscriptionByEmail(email)
  if (!existing) return
  upsertSubscription({
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

export function listAllSubscriptions(): SubscriptionRecord[] {
  const store = readStore()
  return Object.values(store.byEmail).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}

export function adminUpdateSubscription(
  email: string,
  updates: Partial<Pick<SubscriptionRecord, 'plan' | 'status' | 'currentPeriodEnd'>>,
): SubscriptionRecord | null {
  const existing = getSubscriptionByEmail(email)
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
