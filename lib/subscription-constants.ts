import type { PlanId } from '@/types/subscription'

export const FREE_WEEKLY_PREDICTION_LIMIT = 3

export function planDisplayName(plan: PlanId): string {
  switch (plan) {
    case 'premium_monthly':
      return 'Premium Mensuel'
    case 'premium_annual':
      return 'Premium Annuel'
    default:
      return 'Gratuit'
  }
}
