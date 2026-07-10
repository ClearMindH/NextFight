'use client'

import Link from 'next/link'
import { FEATURED_UFC_FREE_FIGHT_ID } from '@/lib/event-urgency'
import { STRIPE_PLANS, isPaidPlan } from '@/lib/stripe-plans'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { FadeIn } from '@/components/motion/FadeIn'

/** Bloc tarifs accueil — version compacte. Détail : /pricing */
export function Pricing() {
  const freePlan = STRIPE_PLANS.find((p) => p.id === 'free')
  const monthly = STRIPE_PLANS.find((p) => p.id === 'premium_monthly')

  return (
    <section id="pricing" className="section-padding border-t border-border bg-background">
      <div className="container-content">
        <FadeIn className="mx-auto max-w-lg text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-warm">
            Nos offres
          </p>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Tarifs UFC
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-warm">
            Co-main gratuit sur chaque carte. Premium pour débloquer tous les combats du mois.
          </p>
        </FadeIn>

        <div className="mx-auto mt-10 flex max-w-lg flex-col gap-4 sm:max-w-xl">
          {freePlan && (
            <FadeIn>
              <div className="rounded-[1.25rem] border border-[#1f1d1a] bg-[#0a0a0a] px-6 py-7 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-warm">
                      {freePlan.name}
                    </p>
                    <p className="mt-2 text-sm text-muted-warm">{freePlan.description}</p>
                  </div>
                  <p className="shrink-0 font-display text-2xl font-semibold tabular-nums">
                    {freePlan.priceLabel}
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href={`/fight/${FEATURED_UFC_FREE_FIGHT_ID}`}
                    className="block w-full rounded-full border border-[#2a2824] py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-gold-soft/45 hover:bg-[#11100e]"
                  >
                    Essayer le co-main gratuit
                  </Link>
                </div>
              </div>
            </FadeIn>
          )}
          {monthly && isPaidPlan(monthly.id) && (
            <FadeIn delay={0.06}>
              <div className="rounded-[1.25rem] border border-gold-soft/35 bg-[#0f0e0c] px-6 py-7 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-warm">
                      Premium mensuel
                    </p>
                    <p className="mt-2 text-sm text-muted-warm">{monthly.description}</p>
                  </div>
                  <p className="shrink-0 font-display text-2xl font-semibold tabular-nums">
                    {monthly.priceLabel}
                    <span className="text-sm font-normal text-[#6b6b6b]">{monthly.period}</span>
                  </p>
                </div>
                <div className="mt-6">
                  <StripeCheckoutButton planId={monthly.id} highlighted className="!rounded-full">
                    {monthly.cta}
                  </StripeCheckoutButton>
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center">
          <Link
            href="/pricing"
            className="text-sm text-muted-warm transition-colors hover:text-gold-soft"
          >
            Voir tous les détails des offres →
          </Link>
        </p>
      </div>
    </section>
  )
}
