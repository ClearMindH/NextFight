'use client'

import Link from 'next/link'
import { Check, User } from 'lucide-react'
import { STRIPE_PLANS, isPaidPlan } from '@/lib/stripe-plans'
import { planDisplayName } from '@/lib/subscription-constants'
import { useSubscription } from '@/hooks/useSubscription'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { BillingPortalButton } from '@/components/stripe/BillingPortalButton'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

export function AccountClient() {
  const { status, loading, isPremium } = useSubscription()

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Mon compte</h1>
      <p className="mt-2 text-muted text-sm">Abonnement Premium et facturation Stripe.</p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <User size={22} />
        </div>
        <div>
          <p className="font-medium">Membre NextFight</p>
          <p className="text-sm text-muted mt-1">
            {status.email ?? 'Identifiant fourni après paiement Stripe'}
          </p>
          <Link href="/pricing" className="mt-3 inline-block text-sm text-gold hover:underline">
            Voir les offres →
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-gold/5 p-6">
        <p className="text-sm text-muted">Plan actuel</p>
        {loading ? (
          <p className="mt-2 text-muted text-sm">Chargement…</p>
        ) : (
          <>
            <p className="mt-1 font-display text-xl font-semibold">
              {planDisplayName(status.plan)}
            </p>
            {isPremium && status.currentPeriodEnd && (
              <p className="mt-2 text-sm text-muted">
                Renouvellement : {formatShortDate(status.currentPeriodEnd)}
              </p>
            )}
            {!isPremium && (
              <p className="mt-2 text-sm text-muted">
                Accès limité aux pronostics publics. Passez Premium pour tout débloquer.
              </p>
            )}
          </>
        )}
      </div>

      {!isPremium && (
        <div className="mt-8 space-y-4">
          {STRIPE_PLANS.filter((p) => isPaidPlan(p.id)).map((p) => (
            <div
              key={p.id}
              className={cn(
                'rounded-2xl border p-5',
                p.highlighted ? 'border-gold bg-gold/5' : 'border-border bg-card',
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{p.name}</span>
                <span className="font-display font-semibold">
                  {p.priceLabel}
                  {p.period}
                </span>
              </div>
              <ul className="mt-3 space-y-1">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted">
                    <Check size={12} className="text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <StripeCheckoutButton planId={p.id} highlighted={p.highlighted}>
                  {p.cta}
                </StripeCheckoutButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPremium && (
        <div className="mt-8">
          <BillingPortalButton>Gérer la facturation</BillingPortalButton>
        </div>
      )}
    </div>
  )
}
