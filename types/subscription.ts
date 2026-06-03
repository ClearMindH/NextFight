export type PlanId = 'free' | 'premium_monthly' | 'premium_annual'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'inactive'

export interface SubscriptionRecord {
  email: string
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  plan: PlanId
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string
}

export interface SubscriptionStatusResponse {
  email: string | null
  plan: PlanId
  isPremium: boolean
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  features: {
    allPredictions: boolean
    detailedAnalysis: boolean
    history: boolean
    advancedComparator: boolean
  }
}
