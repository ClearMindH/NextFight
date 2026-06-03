import type { PlanId, SubscriptionStatusResponse } from '@/types/subscription'
import {
  buildFreeSubscription,
  getSubscriptionByEmail,
  isActivePremium,
} from '@/lib/subscription-store'

export async function buildSubscriptionStatus(
  email: string | null,
): Promise<SubscriptionStatusResponse> {
  if (!email) {
    return freeStatus(null)
  }

  const record = await getSubscriptionByEmail(email)
  const premium = isActivePremium(record)

  return {
    email,
    plan: premium && record ? record.plan : 'free',
    isPremium: premium,
    status: record?.status ?? 'inactive',
    currentPeriodEnd: record?.currentPeriodEnd ?? null,
    features: {
      allPredictions: premium,
      detailedAnalysis: premium,
      history: premium,
      advancedComparator: premium,
    },
  }
}

function freeStatus(email: string | null): SubscriptionStatusResponse {
  if (email) buildFreeSubscription(email)
  return {
    email,
    plan: 'free',
    isPremium: false,
    status: 'inactive',
    currentPeriodEnd: null,
    features: {
      allPredictions: false,
      detailedAnalysis: false,
      history: false,
      advancedComparator: false,
    },
  }
}

export function canAccessPremiumFeature(
  status: SubscriptionStatusResponse,
  feature: keyof SubscriptionStatusResponse['features'],
): boolean {
  return status.features[feature]
}

export { FREE_WEEKLY_PREDICTION_LIMIT, planDisplayName } from '@/lib/subscription-constants'
