import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { PlanId, SubscriptionRecord, SubscriptionStatus } from '@/types/subscription'

interface SubscriptionRow {
  email: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan: PlanId
  status: SubscriptionStatus
  current_period_end: string | null
  cancel_at_period_end: boolean
  updated_at: string
}

function rowToRecord(row: SubscriptionRow): SubscriptionRecord {
  return {
    email: row.email,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    plan: row.plan,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    updatedAt: row.updated_at,
  }
}

function recordToRow(record: SubscriptionRecord): SubscriptionRow {
  return {
    email: record.email.toLowerCase().trim(),
    stripe_customer_id: record.stripeCustomerId,
    stripe_subscription_id: record.stripeSubscriptionId,
    plan: record.plan,
    status: record.status,
    current_period_end: record.currentPeriodEnd,
    cancel_at_period_end: record.cancelAtPeriodEnd,
    updated_at: record.updatedAt,
  }
}

export async function supabaseGetByEmail(
  email: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) throw new Error(`Supabase getByEmail: ${error.message}`)
  if (!data) return null
  return rowToRecord(data as SubscriptionRow)
}

export async function supabaseGetByCustomerId(
  customerId: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (error) throw new Error(`Supabase getByCustomerId: ${error.message}`)
  if (!data) return null
  return rowToRecord(data as SubscriptionRow)
}

export async function supabaseUpsert(
  record: SubscriptionRecord,
): Promise<SubscriptionRecord> {
  const next: SubscriptionRecord = {
    ...record,
    email: record.email.toLowerCase().trim(),
    updatedAt: new Date().toISOString(),
  }

  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert(recordToRow(next), { onConflict: 'email' })
    .select('*')
    .single()

  if (error) throw new Error(`Supabase upsert: ${error.message}`)
  return rowToRecord(data as SubscriptionRow)
}

export async function supabaseListAll(): Promise<SubscriptionRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Supabase list: ${error.message}`)
  return (data as SubscriptionRow[]).map(rowToRecord)
}
