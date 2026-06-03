import { STRIPE_PLANS } from '@/lib/stripe-plans'
import type { FaqItem, PricingPlan, Testimonial } from '@/types'

export const landingStats = [
  { value: 5, suffix: '', label: 'Promotions couvertes' },
  { value: 50, suffix: 'K+', label: 'Combats analysés' },
  { value: 84, suffix: '+', label: 'Combats programmés suivis' },
  { value: 12, suffix: 'K+', label: 'Membres actifs' },
]

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

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alexandre Martin',
    role: 'Fan UFC',
    quote:
      'Les pages pronostics UFC sont claires : probabilités, méthode, round. Exactement ce qu’il me faut avant un événement.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Journaliste MMA',
    quote:
      'Interface premium, sans ambiance site de paris. J’utilise les fiches combat pour mes previews.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Michał Kowalski',
    role: 'Fan KSW',
    quote:
      'Enfin des pronostics KSW au même niveau que l’UFC. La page dédiée est indispensable.',
    rating: 5,
  },
  {
    id: '4',
    name: 'David Okonkwo',
    role: 'Coach',
    quote:
      'Mes athlètes consultent les matchups sur NextFight. Les stats comparées sur chaque combat sont top.',
    rating: 5,
  },
  {
    id: '5',
    name: 'Emma Laurent',
    role: 'Média ARES',
    quote:
      'On s’appuie sur NextFight pour préparer les soirées ARES. Le Premium vaut le coup pour les analyses complètes.',
    rating: 5,
  },
  {
    id: '6',
    name: 'James O\'Brien',
    role: 'Fan PFL',
    quote:
      'Le format tournoi PFL est bien pris en compte. Les pronostics suivent la saison.',
    rating: 5,
  },
]

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
