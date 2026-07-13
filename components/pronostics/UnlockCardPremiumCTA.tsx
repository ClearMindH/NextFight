'use client'

import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import type { Event } from '@/types'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

type UnlockCardPremiumCTAProps = {
  event: Event
  className?: string
  /** Variante plus compacte sous le pronostic gratuit. */
  variant?: 'banner' | 'inline'
}

export function UnlockCardPremiumCTA({
  event,
  className,
  variant = 'banner',
}: UnlockCardPremiumCTAProps) {
  const { isPremium, loading } = useSubscription()
  const lockedCount = Math.max(event.fights.length - 1, 0)

  if (loading || isPremium || lockedCount === 0) return null

  const isBanner = variant === 'banner'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 border-[#e8c840]/35 bg-gradient-to-br from-[#14120a] via-[#0f0e0a] to-[#0a0a0a]',
        isBanner ? 'px-5 py-6 sm:px-7 sm:py-8' : 'px-4 py-5 sm:px-5',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(232,200,64,0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8c840]/15">
            <Lock className="h-5 w-5 text-[#e8c840]" aria-hidden />
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8c840]">
              <Sparkles className="h-3 w-3" aria-hidden />
              Premium · {event.name}
            </p>
            <h3
              className={cn(
                'mt-2 font-display font-semibold tracking-tight text-white',
                isBanner ? 'text-xl sm:text-2xl' : 'text-lg',
              )}
            >
              Débloquez les {lockedCount} autres combats de la carte
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#a8a29e]">
              Picks visibles sur chaque combat — débloquez facteurs clés, méthode et lecture
              matchup pour les {lockedCount} analyses Premium.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-[#8a8278] sm:text-sm">
          <li>· Pronostic complet combat par combat</li>
          <li>· Main event et co-main inclus</li>
          <li>· Toutes les cartes UFC du mois</li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <StripeCheckoutButton
            planId="premium_monthly"
            highlighted
            className={cn('w-full', isBanner ? 'sm:max-w-xs' : 'sm:max-w-[280px]')}
          >
            S&apos;abonner · {PREMIUM_MONTHLY_PRICE_LABEL}/mois
          </StripeCheckoutButton>
          <Link
            href="/pricing"
            className="text-center text-sm font-medium text-[#c9b896] transition-colors hover:text-[#e8c840] sm:text-left"
          >
            Voir ce qui est inclus →
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-[#5c5c5c]">
          Paiement direct Stripe · pas de compte requis avant la carte
        </p>
      </div>
    </div>
  )
}
