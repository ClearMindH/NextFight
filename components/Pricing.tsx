'use client'

import { Check } from 'lucide-react'
import { STRIPE_PLANS } from '@/lib/stripe-plans'
import { isPaidPlan } from '@/lib/stripe-plans'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/utils/cn'

export function Pricing() {
  return (
    <section id="pricing" className="section-padding border-t border-border">
      <div className="container-content">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Tarifs</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Offres pour analystes sérieux
          </h2>
          <p className="mt-3 text-muted text-sm sm:text-base">
            Gratuit pour démarrer. Premium pour tous les pronostics, analyses détaillées et outils avancés.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STRIPE_PLANS.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex h-full flex-col rounded-2xl border p-6',
                  plan.highlighted
                    ? 'border-gold/50 bg-card shadow-lg shadow-gold/5'
                    : 'border-border bg-card/50',
                )}
              >
                {plan.highlighted && (
                  <span className="mb-4 w-fit rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Populaire
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-muted text-sm">{plan.description}</p>
                <p className="mt-6 font-display text-3xl font-semibold">
                  {plan.priceLabel}
                  {plan.period && (
                    <span className="text-base font-normal text-muted">{plan.period}</span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                      <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {isPaidPlan(plan.id) ? (
                    <StripeCheckoutButton planId={plan.id} highlighted={plan.highlighted}>
                      {plan.cta}
                    </StripeCheckoutButton>
                  ) : (
                    <Link
                      href="/register"
                      className="block w-full rounded-full border border-border py-2.5 text-center text-sm font-medium hover:border-gold/40 transition-colors"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
