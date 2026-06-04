import { STRIPE_PLANS } from '@/lib/stripe-plans'
import type { FaqItem, PricingPlan } from '@/types'

export const pricingPlans: PricingPlan[] = STRIPE_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.priceLabel,
  period: p.period,
  description: p.description,
  features: p.features,
  highlighted: p.highlighted,
  cta: p.cta,
}))

export const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'NextFight est-il un site de paris sportifs ?',
    answer:
      'Non. NextFight publie des pronostics et analyses MMA à titre informatif. Nous ne proposons aucun pari ni bookmaker.',
  },
  {
    id: '2',
    question: 'Quelles promotions sont couvertes ?',
    answer:
      'UFC, PFL, KSW, ARES Fighting Championship et Hexagone MMA, chacune avec une page pronostics dédiée.',
  },
  {
    id: '3',
    question: 'Quelle est la précision des pronostics ?',
    answer:
      'Les probabilités combinent statistiques officielles, classements, forme récente (quand disponible) et un modèle de force relative. La confiance affichée reflète la qualité des données — pas un taux de réussite garanti.',
  },
  {
    id: '4',
    question: 'Que comprend l’offre gratuite ?',
    answer:
      'Le pronostic complet du co-main (2e combat de la carte) est gratuit. Le main event et le reste de la carte nécessitent Premium.',
  },
  {
    id: '5',
    question: 'Puis-je annuler le Premium ?',
    answer:
      'Oui, via le portail Stripe. L’accès Premium reste actif jusqu’à la fin de la période payée.',
  },
  {
    id: '6',
    question: 'Proposez-vous des offres équipe ou média ?',
    answer:
      'Contactez-nous pour des accès groupés ou partenariats média autour des pronostics.',
  },
]
