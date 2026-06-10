import Link from 'next/link'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { PlanComparisonTable } from '@/components/conversion/PlanComparisonTable'
import { PremiumPreviewSection } from '@/components/conversion/PremiumPreviewSection'
import { SocialProofSection } from '@/components/conversion/SocialProofSection'
import { STRIPE_PLANS, isPaidPlan } from '@/lib/stripe-plans'
import type { PlanId } from '@/types/subscription'
import { cn } from '@/utils/cn'

const FAQ = [
  {
    q: 'Puis-je annuler quand je veux ?',
    a: 'Oui, depuis votre compte ou le portail Stripe.',
  },
  {
    q: 'Le gratuit suffit-il pour tester ?',
    a: 'Oui : co-main par carte et calendrier. Premium débloque le reste.',
  },
  {
    q: 'Paiement sécurisé ?',
    a: 'Checkout Stripe. Nous ne stockons pas vos coordonnées bancaires.',
  },
]

const freePlan = STRIPE_PLANS.find((p) => p.id === 'free')!
const monthlyPlan = STRIPE_PLANS.find((p) => p.id === 'premium_monthly')!
const annualPlan = STRIPE_PLANS.find((p) => p.id === 'premium_annual')!

const monthlyYear = 9.99 * 12
const annualPrice = 79.99
const savingsPct = Math.round((1 - annualPrice / monthlyYear) * 100)

function Divider() {
  return (
    <div className="flex items-center gap-4 py-2" aria-hidden>
      <span className="h-px flex-1 bg-[#c9b896]/25" />
      <span className="h-1 w-1 rotate-45 border border-[#c9b896]/40 bg-transparent" />
      <span className="h-px flex-1 bg-[#c9b896]/25" />
    </div>
  )
}

function PricingOfferCard({
  label,
  title,
  description,
  price,
  period,
  badge,
  children,
  featured,
}: {
  label: string
  title: string
  description: string
  price: string
  period?: string
  badge?: string
  children: React.ReactNode
  featured?: boolean
}) {
  return (
    <article
      className={cn(
        'relative px-6 py-8 sm:px-8 sm:py-9',
        featured
          ? 'rounded-[1.25rem] border border-[#c9b896]/35 bg-[#0f0e0c] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]'
          : 'rounded-[1.25rem] border border-[#1f1d1a] bg-[#0a0a0a]',
      )}
    >
      {featured && (
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b896]/50 to-transparent sm:inset-x-8"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8a8278]">
            {label}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
            {title}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          {badge && (
            <span className="mb-2 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c9b896]">
              {badge}
            </span>
          )}
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-[#f5f2eb] sm:text-[2rem]">
            {price}
          </p>
          {period && (
            <p className="mt-0.5 text-xs tracking-wide text-[#6b6b6b]">{period}</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#8a8278]">{description}</p>
      <div className="mt-7">{children}</div>
    </article>
  )
}

export function PricingPageContent() {
  return (
    <div className="bg-[#050505] text-[#f5f2eb]">
      <section className="section-padding pb-4 pt-10 sm:pt-14">
        <div className="container-content">
          <div className="mx-auto max-w-lg text-center sm:max-w-xl">
            <Divider />
            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.32em] text-[#8a8278]">
              Nos offres
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tarifs
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#8a8278]">
              Analyses MMA, sans bookmaker. Choisissez l’accès qui correspond à votre rythme.
            </p>
            <Divider />
          </div>

          <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5 sm:max-w-xl sm:gap-6">
            <PricingOfferCard
              label="Offre 01"
              title={freePlan.name}
              description={freePlan.description}
              price={freePlan.priceLabel}
            >
              <Link
                href="/fight/ufc-freedom-250-f2"
                className="block w-full rounded-full border border-[#2a2824] py-3.5 text-center text-sm font-medium text-[#f5f2eb] transition-colors hover:border-[#c9b896]/45 hover:bg-[#11100e]"
              >
                Voir l&apos;analyse gratuite Gane vs Pereira
              </Link>
            </PricingOfferCard>

            <PricingOfferCard
              label="Offre 02"
              title="Premium mensuel"
              description={monthlyPlan.description}
              price={monthlyPlan.priceLabel}
              period={monthlyPlan.period}
              featured
            >
              <StripeCheckoutButton
                planId={'premium_monthly' as PlanId}
                highlighted
                className="!w-full !rounded-full !py-3.5 !text-sm !font-semibold"
              >
                {monthlyPlan.cta}
              </StripeCheckoutButton>
            </PricingOfferCard>

            <PricingOfferCard
              label="Offre 03"
              title="Premium annuel"
              description={annualPlan.description}
              price={annualPlan.priceLabel}
              period={annualPlan.period}
              badge={`−${savingsPct}%`}
            >
              <p className="mb-4 text-center text-xs text-[#c9b896]">
                ≈ {(annualPrice / 12).toFixed(2).replace('.', ',')}€ / mois · économisez environ{' '}
                {Math.round(monthlyYear - annualPrice)}€ / an
              </p>
              <StripeCheckoutButton
                planId={'premium_annual' as PlanId}
                className="!w-full !rounded-full !border !border-[#c9b896]/40 !bg-transparent !py-3.5 !text-sm !font-medium !text-[#c9b896] hover:!bg-[#c9b896]/10"
              >
                {annualPlan.cta}
              </StripeCheckoutButton>
            </PricingOfferCard>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-center text-[11px] leading-relaxed text-[#5c5c5c] sm:max-w-xl">
            UFC · PFL · KSW · ARES · Hexagone — paiement sécurisé Stripe · accès immédiat ·
            annulation à tout moment
          </p>
        </div>
      </section>

      <PlanComparisonTable />
      <PremiumPreviewSection />

      <section className="border-t border-[#1a1816]">
        <div className="container-content section-padding">
          <div className="mx-auto max-w-lg sm:max-w-xl">
            <h2 className="text-center font-display text-lg font-semibold tracking-tight">
              Questions fréquentes
            </h2>
            <dl className="mt-8 space-y-6">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="text-center">
                  <dt className="text-sm font-medium text-[#f5f2eb]">{q}</dt>
                  <dd className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#8a8278]">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <SocialProofSection className="border-t-0" compact />

      <section className="border-t border-[#1a1816] pb-16 pt-10">
        <div className="container-content text-center">
          <p className="font-display text-lg text-[#f5f2eb]">UFC Freedom 250 — Samedi 15 juin</p>
          <p className="mt-2 text-sm text-[#8a8278]">Topuria vs Gaethje analysé en détail pour les membres Premium.</p>
          <div className="mx-auto mt-6 flex max-w-xs flex-col gap-3">
            {isPaidPlan('premium_annual') && (
              <StripeCheckoutButton
                planId="premium_annual"
                highlighted
                className="!w-full !rounded-full !py-3.5 !text-sm"
              >
                Débloquer Topuria vs Gaethje →
              </StripeCheckoutButton>
            )}
            <Link
              href="/fight/ufc-freedom-250-f2"
              className="text-sm text-[#8a8278] transition-colors hover:text-[#c9b896]"
            >
              Voir l&apos;analyse gratuite Gane vs Pereira
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
