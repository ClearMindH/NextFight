import { PricingPageContent } from '@/components/pricing/PricingPageContent'

export const metadata = {
  title: 'Tarifs | NextFight',
  description:
    'Abonnements NextFight : gratuit pour le co-main, Premium pour tous les pronostics MMA (UFC, PFL, KSW, ARES, Hexagone) et analyses détaillées.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-site-header">
      <PricingPageContent />
    </main>
  )
}
