import Link from 'next/link'
import { Check, Lock, Sparkles } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { EventCountdown } from '@/components/conversion/EventCountdown'
import { PlanComparisonTable } from '@/components/conversion/PlanComparisonTable'
import { PremiumPreviewSection } from '@/components/conversion/PremiumPreviewSection'
import { PricingCredibilityStats } from '@/components/conversion/PricingCredibilityStats'
import { SocialProofSection } from '@/components/conversion/SocialProofSection'
import {
  UFC_FREEDOM_250_DATE_LABEL,
  UFC_FREEDOM_250_EVENT_LABEL,
  UFC_FREEDOM_250_TIME_LABEL,
} from '@/lib/event-urgency'
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

const PREMIUM_HIGHLIGHTS = [
  'Tous les combats de chaque carte',
  'Main events & analyses détaillées',
  'UFC · PFL · KSW · ARES · Hexagone',
  'Probabilités & confiance du modèle',
  'Accès immédiat · annulation libre',
] as const

const freePlan = STRIPE_PLANS.find((p) => p.id === 'free')!
const monthlyPlan = STRIPE_PLANS.find((p) => p.id === 'premium_monthly')!
const annualPlan = STRIPE_PLANS.find((p) => p.id === 'premium_annual')!

const monthlyYear = 9.99 * 12
const annualPrice = 79.99
const savingsPct = Math.round((1 - annualPrice / monthlyYear) * 100)

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
  badge,
  ribbon,
  children,
  variant = 'default',
}: {
  label: string
  title: string
  description: string
  price: string
  period?: string
  badge?: string
  ribbon?: string
  children: React.ReactNode
  variant?: 'default' | 'featured' | 'value'
}) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border px-4 py-5 sm:px-5 sm:py-6',
        variant === 'featured' &&
          'z-10 border-[#c9b896]/50 bg-gradient-to-b from-[#1a1610] via-[#0f0e0c] to-[#0a0908] shadow-[0_0_40px_-8px_rgba(201,184,150,0.35)] ring-1 ring-[#c9b896]/25 lg:scale-[1.03]',
        variant === 'value' &&
          'border-[#c9b896]/30 bg-gradient-to-b from-[#12100c] to-[#0a0a0a]',
        variant === 'default' && 'border-[#1f1d1a] bg-[#080808]/80',
      )}
    >
      {ribbon && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#c9b896] px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a0a0a] shadow-lg">
          {ribbon}
        </span>
      )}

      {variant === 'featured' && (
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b896]/60 to-transparent sm:inset-x-5"
          aria-hidden
        />
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
          {badge && (
            <span className="mb-1 inline-block rounded-full border border-[#c9b896]/35 bg-[#c9b896]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c9b896]">
              {badge}
            </span>
          )}
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
      {/* ── Hero + offres (above the fold) ── */}
      <section className="relative overflow-hidden border-b border-[#1a1816] pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,162,39,0.14),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_20%,rgba(185,28,28,0.08),transparent)]"
          aria-hidden
        />

        <div className="container-content relative">
          {/* En-tête compact */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#B91C1C]/35 bg-[#1a0a0a]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#e8a0a0]">
              <Sparkles className="h-3 w-3" aria-hidden />
              UFC Freedom 250 · {UFC_FREEDOM_250_EVENT_LABEL}
            </p>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
              Débloquez tous les pronostics MMA
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#8a8278] sm:text-sm">
              Co-main gratuit pour tester · Premium pour chaque combat, chaque organisation, chaque
              carte.
            </p>
            <div className="mt-4">
              <PricingCredibilityStats variant="compact" />
            </div>
          </div>

          {/* Grille principale : urgence + 3 offres */}
          <div className="mx-auto mt-6 max-w-5xl lg:mt-8">
            <div className="grid gap-4 lg:grid-cols-[11rem_1fr] lg:gap-5 xl:grid-cols-[12rem_1fr]">
              {/* Colonne urgence — desktop */}
              <aside className="hidden lg:flex lg:flex-col lg:gap-3">
                <EventCountdown variant="compact" />
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

              {/* Offres */}
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="order-2 sm:order-1">
                  <PricingOfferCard
                    label="Découverte"
                    title={freePlan.name}
                    description={freePlan.description}
                    price={freePlan.priceLabel}
                    variant="default"
                  >
                    <FeatureList items={freePlan.features} />
                    <Link
                      href="/fight/ufc-freedom-250-f2"
                      className="mt-4 block w-full rounded-full border border-[#2a2824] py-2.5 text-center text-[11px] font-medium text-[#c8c0b4] transition-colors hover:border-[#c9b896]/40 hover:text-[#f5f2eb]"
                    >
                      Essayer Gane vs Pereira
                    </Link>
                  </PricingOfferCard>
                </div>

                <div className="order-1 sm:order-2">
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

                <div className="order-3">
                  <PricingOfferCard
                    label="Meilleur prix"
                    title="Premium annuel"
                    description={annualPlan.description}
                    price={annualPlan.priceLabel}
                    period={annualPlan.period}
                    badge={`−${savingsPct}%`}
                    variant="value"
                  >
                    <p className="mt-1 text-center text-[10px] text-[#c9b896]">
                      ≈ {(annualPrice / 12).toFixed(2).replace('.', ',')}€/mois · −
                      {Math.round(monthlyYear - annualPrice)}€/an
                    </p>
                    <FeatureList items={annualPlan.features.slice(0, 3)} accent="gold" />
                    <StripeCheckoutButton
                      planId={'premium_annual' as PlanId}
                      className="!mt-4 !w-full !rounded-full !border !border-[#c9b896]/45 !bg-[#c9b896]/10 !py-2.5 !text-xs !font-semibold !text-[#c9b896] hover:!bg-[#c9b896]/20"
                    >
                      {annualPlan.cta}
                    </StripeCheckoutButton>
                  </PricingOfferCard>
                </div>
              </div>
            </div>

            {/* Mobile : countdown + bénéfices */}
            <div className="mt-4 space-y-3 lg:hidden">
              <EventCountdown variant="compact" />
              <div className="flex flex-wrap justify-center gap-1.5">
                {PREMIUM_HIGHLIGHTS.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full border border-[#1f1d1a] bg-[#0a0a0a] px-2 py-1 text-[9px] text-[#9a9288]"
                  >
                    <Check className="h-2.5 w-2.5 text-[#c9b896]" aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-center text-[10px] leading-relaxed text-[#5c5c5c]">
            Paiement sécurisé Stripe · accès immédiat · annulation à tout moment · sans engagement
            caché
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
            <p className="font-display text-lg text-[#f5f2eb]">UFC Freedom 250 — {UFC_FREEDOM_250_DATE_LABEL}</p>
            <p className="mt-1 text-xs text-[#c9b896]">Début carte principale · {UFC_FREEDOM_250_TIME_LABEL}</p>
            <p className="mt-1.5 text-xs text-[#8a8278]">
              Topuria vs Gaethje analysé en détail pour les membres Premium.
            </p>
            <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2.5">
              {isPaidPlan('premium_monthly') && (
                <StripeCheckoutButton
                  planId="premium_monthly"
                  highlighted
                  className="!w-full !rounded-full !py-3 !text-sm !font-semibold"
                >
                  Débloquer Topuria vs Gaethje →
                </StripeCheckoutButton>
              )}
              <Link
                href="/fight/ufc-freedom-250-f2"
                className="text-xs text-[#8a8278] transition-colors hover:text-[#c9b896]"
              >
                Voir l&apos;analyse gratuite Gane vs Pereira
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
