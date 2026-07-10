import Link from 'next/link'
import { Check, Lock, Sparkles } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { EventCountdown } from '@/components/conversion/EventCountdown'
import { PlanComparisonTable } from '@/components/conversion/PlanComparisonTable'
import { PremiumPreviewSection } from '@/components/conversion/PremiumPreviewSection'
import { PricingCredibilityStats } from '@/components/conversion/PricingCredibilityStats'
import { SocialProofSection } from '@/components/conversion/SocialProofSection'
import {
  FEATURED_UFC_DATE_LABEL,
  FEATURED_UFC_EVENT_LABEL,
  FEATURED_UFC_FREE_FIGHT_ID,
  FEATURED_UFC_TIME_LABEL,
} from '@/lib/event-urgency'
import { PREMIUM_MONTHLY_PRICE_LABEL, STRIPE_PLANS } from '@/lib/stripe-plans'
import type { PlanId } from '@/types/subscription'
import { cn } from '@/utils/cn'

const FAQ = [
  {
    q: 'Puis-je annuler quand je veux ?',
    a: 'Oui, depuis votre compte ou le portail Stripe.',
  },
  {
    q: 'Le gratuit suffit-il pour tester ?',
    a: 'Oui : co-main gratuit sur chaque carte UFC. Premium débloque tous les combats du mois.',
  },
  {
    q: 'Faut-il un compte avant de payer ?',
    a: 'Oui : connectez-vous avec votre email (lien magique), puis passez Premium. Votre abonnement reste lié à cet email.',
  },
]

const PREMIUM_HIGHLIGHTS = [
  'Tous les combats de chaque carte UFC du mois',
  'Main events & analyses détaillées',
  'Probabilités & confiance du modèle',
  'Accès immédiat · annulation libre',
] as const

const freePlan = STRIPE_PLANS.find((p) => p.id === 'free')!
const monthlyPlan = STRIPE_PLANS.find((p) => p.id === 'premium_monthly')!

function FeatureList({ items, accent }: { items: readonly string[]; accent?: 'gold' | 'muted' }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[11px] leading-snug text-[#a8a095]">
          <Check
            className={cn(
              'mt-0.5 h-3 w-3 shrink-0',
              accent === 'gold' ? 'text-[#c9b896]' : 'text-[#5c5c5c]',
            )}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PricingOfferCard({
  label,
  title,
  description,
  price,
  period,
  ribbon,
  children,
  variant = 'default',
}: {
  label: string
  title: string
  description: string
  price: string
  period?: string
  ribbon?: string
  children: React.ReactNode
  variant?: 'default' | 'featured'
}) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border px-4 py-5 sm:px-5 sm:py-6',
        variant === 'featured' &&
          'z-10 border-[#c9b896]/50 bg-gradient-to-b from-[#1a1610] via-[#0f0e0c] to-[#0a0908] shadow-[0_0_40px_-8px_rgba(201,184,150,0.35)] ring-1 ring-[#c9b896]/25',
        variant === 'default' && 'border-[#1f1d1a] bg-[#080808]/80',
      )}
    >
      {ribbon && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#c9b896] px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a0a0a] shadow-lg">
          {ribbon}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#6b6560]">
            {label}
          </p>
          <h2 className="mt-1 font-display text-base font-semibold tracking-tight text-[#f5f2eb] sm:text-lg">
            {title}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              'font-display font-semibold tabular-nums tracking-tight',
              variant === 'featured' ? 'text-2xl text-[#f5f2eb]' : 'text-xl text-[#f5f2eb]',
            )}
          >
            {price}
          </p>
          {period && <p className="text-[10px] text-[#6b6b6b]">{period}</p>}
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[#8a8278]">{description}</p>
      <div className="mt-auto pt-4">{children}</div>
    </article>
  )
}

export function PricingPageContent() {
  return (
    <div className="bg-[#050505] text-[#f5f2eb]">
      <section className="relative overflow-hidden border-b border-[#1a1816] pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,162,39,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="container-content relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#B91C1C]/35 bg-[#1a0a0a]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#e8a0a0]">
              <Sparkles className="h-3 w-3" aria-hidden />
              UFC 329 · {FEATURED_UFC_EVENT_LABEL}
            </p>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
              Débloquez tous les pronostics UFC du mois
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#8a8278] sm:text-sm">
              Co-main gratuit sur chaque carte · Premium {PREMIUM_MONTHLY_PRICE_LABEL}/mois pour
              toutes les cartes UFC du mois en cours.
            </p>
            <div className="mt-4">
              <PricingCredibilityStats variant="compact" />
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-3xl lg:mt-8">
            <div className="grid gap-4 lg:grid-cols-[11rem_1fr] lg:gap-5">
              <aside className="hidden lg:block">
                <div className="rounded-xl border border-[#1f1d1a] bg-[#0a0a0a]/90 p-3">
                  <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9b896]">
                    <Lock className="h-3 w-3" aria-hidden />
                    Inclus Premium
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {PREMIUM_HIGHLIGHTS.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[10px] leading-snug text-[#9a9288]"
                      >
                        <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[#c9b896]" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <PricingOfferCard
                  label="Découverte"
                  title={freePlan.name}
                  description={freePlan.description}
                  price={freePlan.priceLabel}
                  variant="default"
                >
                  <FeatureList items={freePlan.features} />
                  <Link
                    href={`/fight/${FEATURED_UFC_FREE_FIGHT_ID}`}
                    className="mt-4 block w-full rounded-full border border-[#2a2824] py-2.5 text-center text-[11px] font-medium text-[#c8c0b4] transition-colors hover:border-[#c9b896]/40 hover:text-[#f5f2eb]"
                  >
                    Essayer le co-main gratuit
                  </Link>
                </PricingOfferCard>

                <PricingOfferCard
                  label="Le plus populaire"
                  title="Premium mensuel"
                  description={monthlyPlan.description}
                  price={monthlyPlan.priceLabel}
                  period={monthlyPlan.period}
                  ribbon="Recommandé"
                  variant="featured"
                >
                  <FeatureList items={monthlyPlan.features} accent="gold" />
                  <StripeCheckoutButton
                    planId={'premium_monthly' as PlanId}
                    highlighted
                    className="!mt-4 !w-full !rounded-full !py-2.5 !text-xs !font-bold !shadow-[0_0_24px_-4px_rgba(201,184,150,0.5)]"
                  >
                    {monthlyPlan.cta} →
                  </StripeCheckoutButton>
                </PricingOfferCard>
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-lg sm:mt-6">
              <EventCountdown />
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-center text-[10px] leading-relaxed text-[#5c5c5c]">
            Paiement sécurisé Stripe · accès immédiat · annulation à tout moment
          </p>
        </div>
      </section>

      <PremiumPreviewSection />
      <PlanComparisonTable />

      <section className="border-t border-[#1a1816]">
        <div className="container-content section-padding">
          <div className="mx-auto max-w-lg sm:max-w-xl">
            <h2 className="text-center font-display text-lg font-semibold tracking-tight">
              Questions fréquentes
            </h2>
            <dl className="mt-6 space-y-5">
              {FAQ.map(({ q, a }) => (
                <div
                  key={q}
                  className="rounded-xl border border-[#1f1d1a] bg-[#0a0a0a] px-4 py-4 text-center"
                >
                  <dt className="text-xs font-medium text-[#f5f2eb]">{q}</dt>
                  <dd className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#8a8278]">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <SocialProofSection className="border-t-0" compact />

      <section className="border-t border-[#1a1816] pb-16 pt-8">
        <div className="container-content">
          <div className="mx-auto max-w-xl rounded-2xl border border-[#c9b896]/25 bg-gradient-to-b from-[#12100c] to-[#0a0a0a] px-6 py-8 text-center">
            <p className="font-display text-lg text-[#f5f2eb]">
              UFC 329 — McGregor vs Holloway · {FEATURED_UFC_DATE_LABEL}
            </p>
            <p className="mt-1 text-xs text-[#c9b896]">
              Début carte principale · {FEATURED_UFC_TIME_LABEL}
            </p>
            <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2.5">
              <StripeCheckoutButton
                planId="premium_monthly"
                highlighted
                className="!w-full !rounded-full !py-3 !text-sm !font-semibold"
              >
                Débloquer toute la carte →
              </StripeCheckoutButton>
              <Link
                href={`/fight/${FEATURED_UFC_FREE_FIGHT_ID}`}
                className="text-xs text-[#8a8278] transition-colors hover:text-[#c9b896]"
              >
                Voir le co-main gratuit BSD vs Pimblett
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
