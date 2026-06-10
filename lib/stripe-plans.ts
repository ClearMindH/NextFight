import type { PlanId } from '@/types/subscription'

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
    description: 'Pronostics publics limités',
    priceLabel: '0€',
    amountCents: 0,
    currency: 'eur',
    priceEnvKey: '',
    features: [
      'Pronostic gratuit sur le co-main de chaque carte',
      'Calendrier des combats',
      'Page dédiée par promotion',
    ],
    cta: 'Commencer',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Mensuel',
    description: 'Tous les pronostics et analyses détaillées',
    priceLabel: '9,99€',
    period: '/mois',
    amountCents: 999,
    currency: 'eur',
    interval: 'month',
    priceEnvKey: 'STRIPE_PRICE_PREMIUM_MONTHLY',
    highlighted: true,
    features: [
      'Tous les pronostics détaillés',
      'Analyse détaillée par combat',
      'Probabilités de victoire',
      'Pages combat Premium',
    ],
    cta: 'Débloquer tous les combats',
  },
  {
    id: 'premium_annual',
    name: 'Premium Annuel',
    description: 'Meilleur rapport qualité-prix',
    priceLabel: '79,99€',
    period: '/an',
    amountCents: 7999,
    currency: 'eur',
    interval: 'year',
    priceEnvKey: 'STRIPE_PRICE_PREMIUM_ANNUAL',
    features: [
      'Tous les pronostics détaillés',
      'Analyse détaillée par combat',
      'Probabilités de victoire',
      'Pages combat Premium',
      'Économisez ~33% vs mensuel',
    ],
    cta: 'Accéder à toute la saison',
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
