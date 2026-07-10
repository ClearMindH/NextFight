import type { PlanId } from '@/types/subscription'

export const PREMIUM_MONTHLY_PRICE_LABEL = '4,99€'
export const PREMIUM_MONTHLY_AMOUNT_CENTS = 499

export interface StripePlanConfig {
  id: PlanId
  name: string
  description: string
  priceLabel: string
  period?: string
  amountCents: number
  currency: 'eur'
  interval?: 'month' | 'year'
  priceEnvKey: string
  highlighted?: boolean
  features: string[]
  cta: string
}

export const STRIPE_PLANS: StripePlanConfig[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Co-main gratuit sur chaque carte UFC',
    priceLabel: '0€',
    amountCents: 0,
    currency: 'eur',
    priceEnvKey: '',
    features: [
      'Pronostic gratuit sur le co-main de chaque carte',
      'Probabilités, verdict et facteurs clés',
      'Calendrier UFC à venir',
    ],
    cta: 'Voir le co-main gratuit',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Mensuel',
    description: 'Toutes les cartes UFC du mois en cours',
    priceLabel: PREMIUM_MONTHLY_PRICE_LABEL,
    period: '/mois',
    amountCents: PREMIUM_MONTHLY_AMOUNT_CENTS,
    currency: 'eur',
    interval: 'month',
    priceEnvKey: 'STRIPE_PRICE_PREMIUM_MONTHLY',
    highlighted: true,
    features: [
      'Tous les combats de chaque carte UFC du mois',
      'Main events & analyses détaillées',
      'Probabilités et facteurs du modèle',
      'Accès immédiat · annulation libre',
    ],
    cta: 'Débloquer toutes les cartes du mois',
  },
]

export function getPlanConfig(planId: PlanId): StripePlanConfig | undefined {
  return STRIPE_PLANS.find((p) => p.id === planId)
}

export function getStripePriceId(planId: PlanId): string | null {
  const plan = getPlanConfig(planId)
  if (!plan?.priceEnvKey) return null
  return process.env[plan.priceEnvKey]?.trim() || null
}

export function planIdFromPriceId(priceId: string): PlanId {
  const monthly = process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim()
  const annual = process.env.STRIPE_PRICE_PREMIUM_ANNUAL?.trim()
  if (priceId === annual) return 'premium_annual'
  if (priceId === monthly) return 'premium_monthly'
  return 'free'
}

export function isPaidPlan(planId: PlanId): boolean {
  return planId === 'premium_monthly' || planId === 'premium_annual'
}
