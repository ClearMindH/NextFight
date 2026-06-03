import { Pricing } from '@/components/Pricing'
import { FadeIn } from '@/components/motion/FadeIn'

export const metadata = {
  title: 'Pricing',
  description: 'NextFight plans — Free, Premium and Annual subscriptions for MMA analytics.',
}

export default function PricingPage() {
  return (
    <main className="pt-16">
      <section className="section-padding border-b border-border">
        <div className="container-content max-w-2xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Pricing</p>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Choose your plan
            </h1>
            <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed">
              Start free with limited predictions. Upgrade for unlimited analytics across UFC,
              PFL, KSW, ARES and Hexagone MMA.
            </p>
          </FadeIn>
        </div>
      </section>
      <Pricing />
    </main>
  )
}
