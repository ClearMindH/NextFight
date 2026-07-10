'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  History,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { PlanId } from '@/types/subscription'
import { STRIPE_PLANS, isPaidPlan } from '@/lib/stripe-plans'
import { planDisplayName } from '@/lib/subscription-constants'
import { useSubscription } from '@/hooks/useSubscription'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { BillingPortalButton } from '@/components/stripe/BillingPortalButton'
import { CancelSubscriptionButton } from '@/components/stripe/CancelSubscriptionButton'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const SLIDES = [
  { id: 'profile', label: 'Profil' },
  { id: 'plan', label: 'Plan' },
  { id: 'access', label: 'Accès' },
  { id: 'billing', label: 'Abonnement' },
] as const

const FEATURE_ITEMS = [
  { key: 'allPredictions' as const, label: 'Pronostics complets', icon: Zap },
  { key: 'detailedAnalysis' as const, label: 'Analyses détaillées', icon: BarChart3 },
  { key: 'history' as const, label: 'Historique', icon: History },
  { key: 'advancedComparator' as const, label: 'Comparateur', icon: Layers },
]

const slideMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

export function AccountClient() {
  const { status, loading, isPremium } = useSubscription()
  const [index, setIndex] = useState(0)

  const slide = SLIDES[index]
  const canPrev = index > 0
  const canNext = index < SLIDES.length - 1

  const initials = status.email
    ? status.email.slice(0, 2).toUpperCase()
    : '—'

  function goPrev() {
    if (canPrev) setIndex((i) => i - 1)
  }

  function goNext() {
    if (canNext) setIndex((i) => i + 1)
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* En-tête minimal */}
      <header className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8a8278]">
          Mon compte
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#f5f2eb]">
          Espace membre
        </h1>
      </header>

      {/* Indicateurs — 4 écrans */}
      <nav
        className="mt-10 flex justify-center gap-2"
        aria-label="Sections du compte"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group flex flex-col items-center gap-2 px-2"
            aria-current={i === index ? 'step' : undefined}
            aria-label={s.label}
          >
            <span
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === index
                  ? 'w-10 bg-[#c9b896]'
                  : 'w-6 bg-[#2a2a2a] group-hover:bg-[#3d3d3d]',
              )}
            />
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.14em] transition-colors',
                i === index ? 'text-[#c9b896]' : 'text-[#5c5c5c]',
              )}
            >
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Carte principale — 1 écran visible */}
      <div className="relative mt-8 min-h-[380px] overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0c0c0c]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            {...slideMotion}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 sm:p-10"
          >
            {slide.id === 'profile' && (
              <ScreenProfile
                email={status.email}
                initials={initials}
                isPremium={isPremium}
                loading={loading}
              />
            )}
            {slide.id === 'plan' && (
              <ScreenPlan
                plan={status.plan}
                isPremium={isPremium}
                periodEnd={status.currentPeriodEnd}
                cancelAtPeriodEnd={status.cancelAtPeriodEnd}
                loading={loading}
              />
            )}
            {slide.id === 'access' && (
              <ScreenAccess features={status.features} loading={loading} />
            )}
            {slide.id === 'billing' && (
              <ScreenBilling
                isPremium={isPremium}
                loading={loading}
                email={status.email}
                periodEnd={status.currentPeriodEnd}
                cancelAtPeriodEnd={status.cancelAtPeriodEnd}
                isManualBilling={status.isManualBilling}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation flèches */}
        <div className="flex items-center justify-between border-t border-[#1c1c1c] px-4 py-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a8278] transition-colors hover:bg-[#1a1a1a] hover:text-[#f5f2eb] disabled:opacity-25 disabled:pointer-events-none"
            aria-label="Écran précédent"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-[11px] tabular-nums text-[#5c5c5c]">
            {index + 1} / {SLIDES.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a8278] transition-colors hover:bg-[#1a1a1a] hover:text-[#f5f2eb] disabled:opacity-25 disabled:pointer-events-none"
            aria-label="Écran suivant"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-[#4a4a4a]">
        Paiements sécurisés par Stripe
      </p>
    </div>
  )
}

function ScreenProfile({
  email,
  initials,
  isPremium,
  loading,
}: {
  email: string | null
  initials: string
  isPremium: boolean
  loading: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-medium',
          isPremium
            ? 'bg-[#1a1814] text-[#c9b896] ring-1 ring-[#c9b896]/30'
            : 'bg-[#141414] text-[#a8a8a8] ring-1 ring-[#262626]',
        )}
      >
        {loading ? '…' : initials}
      </div>
      <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#5c5c5c]">Identité</p>
      <p className="mt-2 font-display text-xl text-[#f5f2eb]">
        {loading ? '—' : email?.split('@')[0] ?? 'Invité'}
      </p>
      <p className="mt-2 max-w-xs text-sm text-[#6b6b6b] leading-relaxed">
        {email
          ? isPremium
            ? 'Votre abonnement est actif sur cet appareil.'
            : 'Pas d’abonnement sur cet email. Utilisez l’email du paiement Apple Pay / carte.'
          : 'Déjà abonné sans compte ? Connectez-vous avec l’email de paiement.'}
      </p>
      {!email && (
        <Link
          href="/login"
          className="mt-8 inline-block text-sm text-[#c9b896] hover:underline"
        >
          Recevoir mon lien d&apos;accès
        </Link>
      )}
      {email && !isPremium && !loading && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#c9b896] hover:underline"
          >
            Changer d&apos;email (lien de connexion)
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
              window.location.href = '/login'
            }}
            className="text-xs text-[#5c5c5c] hover:text-[#c9b896] transition-colors"
          >
            Se déconnecter de cet email
          </button>
        </div>
      )}
      {email && (
        <p className="mt-6 text-xs text-[#4a4a4a]">{email}</p>
      )}
    </div>
  )
}

function ScreenPlan({
  plan,
  isPremium,
  periodEnd,
  cancelAtPeriodEnd,
  loading,
}: {
  plan: PlanId
  isPremium: boolean
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
  loading: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c5c5c]">Plan actuel</p>
      {loading ? (
        <p className="mt-8 text-sm text-[#6b6b6b]">Chargement…</p>
      ) : (
        <>
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#f5f2eb]">
            {planDisplayName(plan)}
          </p>
          <p
            className={cn(
              'mt-4 inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.16em]',
              isPremium
                ? 'bg-[#1a1814] text-[#c9b896]'
                : 'bg-[#141414] text-[#6b6b6b]',
            )}
          >
            {isPremium ? 'Membre Premium' : 'Accès limité'}
          </p>
          {isPremium && periodEnd && (
            <PremiumRenewalInfo periodEnd={periodEnd} cancelAtPeriodEnd={cancelAtPeriodEnd} />
          )}
          {!isPremium && (
            <p className="mt-6 max-w-xs mx-auto text-sm text-[#6b6b6b] leading-relaxed">
              Co-main gratuit sur chaque carte. Premium débloque le main event et les analyses.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ScreenAccess({
  features,
  loading,
}: {
  features: {
    allPredictions: boolean
    detailedAnalysis: boolean
    history: boolean
    advancedComparator: boolean
  }
  loading: boolean
}) {
  return (
    <div>
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#5c5c5c]">
        Fonctionnalités
      </p>
      <ul className="mt-8 space-y-3">
        {FEATURE_ITEMS.map((item) => {
          const Icon = item.icon
          const on = !loading && features[item.key]
          return (
            <li
              key={item.key}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3.5',
                on ? 'border-[#2a261c] bg-[#12110e]' : 'border-[#1c1c1c] bg-transparent',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={on ? 'text-[#c9b896]' : 'text-[#404040]'} />
                <span className={cn('text-sm', on ? 'text-[#f5f2eb]' : 'text-[#6b6b6b]')}>
                  {item.label}
                </span>
              </div>
              {on ? (
                <Check size={16} className="text-[#c9b896]" />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-[#404040]">—</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PremiumRenewalInfo({
  periodEnd,
  cancelAtPeriodEnd,
}: {
  periodEnd: string
  cancelAtPeriodEnd?: boolean
}) {
  const end = new Date(periodEnd)
  const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const expiringSoon = daysLeft <= 7

  if (cancelAtPeriodEnd) {
    return (
      <div className="mt-6 space-y-2 text-sm">
        <p className="text-amber-300/90">
          Annulation programmée — accès Premium jusqu’au {formatShortDate(periodEnd)}
        </p>
        <p className="text-xs text-[#8a8278]">Aucun nouveau prélèvement ne sera effectué.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-2 text-sm">
      <p className={expiringSoon ? 'text-amber-400/90' : 'text-[#6b6b6b]'}>
        Prochain renouvellement · {formatShortDate(periodEnd)}
        {daysLeft > 0 && (
          <span className="block text-xs mt-1">
            {expiringSoon
              ? `Plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
              : `(dans ${daysLeft} jours)`}
          </span>
        )}
      </p>
      {expiringSoon && (
        <p className="text-xs text-[#8a8278]">
          Renouvellement automatique sauf annulation.
        </p>
      )}
    </div>
  )
}

function ScreenBilling({
  isPremium,
  loading,
  email,
  periodEnd,
  cancelAtPeriodEnd,
  isManualBilling,
}: {
  isPremium: boolean
  loading: boolean
  email: string | null
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
  isManualBilling: boolean
}) {
  if (loading) {
    return <p className="text-center text-sm text-[#6b6b6b]">Chargement…</p>
  }

  if (isPremium) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#141414] text-[#c9b896]">
          <CreditCard size={22} />
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#5c5c5c]">Facturation</p>
        <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed max-w-xs mx-auto">
          {isManualBilling
            ? 'Abonnement Premium actif sur ce compte. Vous pouvez le résilier ci-dessous.'
            : 'Modifiez votre carte et vos factures via Stripe, ou annulez le renouvellement.'}
        </p>
        {periodEnd && (
          <div className="mt-6 max-w-xs mx-auto text-left">
            <PremiumRenewalInfo periodEnd={periodEnd} cancelAtPeriodEnd={cancelAtPeriodEnd} />
          </div>
        )}
        <div className="mt-8 space-y-3">
          {!isManualBilling && (
            <BillingPortalButton className="w-full rounded-xl bg-[#f5f2eb] text-[#0c0c0c] hover:scale-[1.01]">
              Gérer la facturation Stripe
            </BillingPortalButton>
          )}
          <CancelSubscriptionButton
            manualBilling={isManualBilling}
            alreadyScheduled={cancelAtPeriodEnd}
          />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <QuickLink href="/ufc-pronostics" label="Pronostics UFC" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <Sparkles size={20} className="mx-auto text-[#c9b896]" />
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#5c5c5c]">Passer Premium</p>
      </div>
      <div className="space-y-4">
        {STRIPE_PLANS.filter((p) => isPaidPlan(p.id)).map((p) => (
          <div
            key={p.id}
            className={cn(
              'rounded-xl border p-5',
              p.highlighted
                ? 'border-[#3d3628] bg-[#12110e]'
                : 'border-[#1c1c1c] bg-[#0a0a0a]',
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-[#f5f2eb]">{p.name}</span>
              <span className="font-display text-lg text-[#f5f2eb] tabular-nums">
                {p.priceLabel}
                <span className="text-xs font-normal text-[#6b6b6b]">{p.period}</span>
              </span>
            </div>
            <StripeCheckoutButton
              planId={p.id}
              email={email ?? undefined}
              highlighted={p.highlighted}
              className={cn(
                'mt-4 rounded-xl',
                p.highlighted
                  ? 'bg-[#f5f2eb] text-[#0c0c0c]'
                  : 'border border-[#2a2a2a] bg-transparent text-[#f5f2eb]',
              )}
            >
              {p.cta}
            </StripeCheckoutButton>
          </div>
        ))}
      </div>
      <Link
        href="/pricing"
        className="mt-6 block text-center text-xs text-[#6b6b6b] hover:text-[#c9b896]"
      >
        Voir le détail des offres
      </Link>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[#1c1c1c] px-4 py-2 text-xs text-[#8a8278] transition-colors hover:border-[#3d3628] hover:text-[#c9b896]"
    >
      {label}
    </Link>
  )
}
