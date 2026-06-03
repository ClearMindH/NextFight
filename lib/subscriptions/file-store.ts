import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import type { SubscriptionRecord } from '@/types/subscription'

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

export function fileGetByEmail(email: string): SubscriptionRecord | null {
  const normalized = email.toLowerCase().trim()
  return readStore().byEmail[normalized] ?? null
}

export function fileGetByCustomerId(customerId: string): SubscriptionRecord | null {
  const store = readStore()
  const email = store.byCustomerId[customerId]
  if (!email) return null
  return store.byEmail[email] ?? null
}

export function fileUpsert(record: SubscriptionRecord): SubscriptionRecord {
  const store = readStore()
  const email = record.email.toLowerCase().trim()
  const next: SubscriptionRecord = {
    ...record,
    email,
    updatedAt: new Date().toISOString(),
  }
  store.byEmail[email] = next
  if (record.stripeCustomerId) {
    store.byCustomerId[record.stripeCustomerId] = email
  }
  writeStore(store)
  return next
}

export function fileListAll(): SubscriptionRecord[] {
  return Object.values(readStore().byEmail).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}
