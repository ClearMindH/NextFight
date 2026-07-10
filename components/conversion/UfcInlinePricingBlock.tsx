'use client'

import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

const VALUE_POINTS = [
  'Toutes les cartes UFC du mois en cours',
  'Modèle statistique + facteurs décisifs par combat',
  'Bilan UFC transparent et vérifiable',
] as const

type UfcPricingCtaContentProps = {
  lockedCount?: number
  className?: string
  /** Juste après le verdict — titre + bouton, sans liste. */
  compact?: boolean
}

export function UfcPricingCtaContent({
  lockedCount,
  className,
  compact = false,
}: UfcPricingCtaContentProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9b896]">
        Accès Premium
      </p>
      <p
        className={cn(
          'mt-2 font-display font-semibold tracking-tight text-[#f5f2eb]',
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
        )}
      >
        {lockedCount != null && lockedCount > 0
          ? `Débloquez les ${lockedCount} autres analyses de la carte`
          : 'Débloquez toute la carte'}
      </p>
      <p className="mt-1 text-sm text-[#8a8278]">À partir de 4,99€/mois · annulation libre</p>
      {!compact && (
        <ul className="mt-4 space-y-2">
          {VALUE_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-[#c8c0b4]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', compact ? 'mt-4' : 'mt-5')}>
        <StripeCheckoutButton planId="premium_monthly" highlighted className="w-full sm:max-w-sm">
          Débloquer toutes les analyses →
        </StripeCheckoutButton>
        <Link
          href="/pricing"
          className="text-center text-sm text-[#8a8278] transition-colors hover:text-[#c9b896] sm:text-left"
        >
          Comparer mensuel / annuel →
        </Link>
      </div>
    </div>
  )
}

type UfcPrimaryCtaSectionProps = {
  lockedCount: number
  /** Collé sous le verdict du combat gratuit. */
  variant?: 'section' | 'inline'
}

export function UfcPrimaryCtaSection({
  lockedCount,
  variant = 'section',
}: UfcPrimaryCtaSectionProps) {
  const { isPremium } = useSubscription()

  if (isPremium || lockedCount <= 0) return null

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'rounded-xl border border-[#c9b896]/30',
          'bg-gradient-to-br from-[#16120e] via-[#100e0c] to-[#0a0908] px-4 py-4 sm:rounded-2xl sm:px-5 sm:py-5',
        )}
      >
        <UfcPricingCtaContent lockedCount={lockedCount} compact />
      </div>
    )
  }

  return (
    <section className="border-b border-[#c9b896]/20 bg-gradient-to-b from-[#14100e] to-[#080808]">
      <div className="container-content section-padding">
        <div
          className={cn(
            'mx-auto max-w-4xl rounded-2xl border border-[#c9b896]/30',
            'bg-gradient-to-br from-[#16120e] via-[#100e0c] to-[#0a0908] px-5 py-6 sm:px-7 sm:py-8',
          )}
        >
          <UfcPricingCtaContent lockedCount={lockedCount} />
        </div>
      </div>
    </section>
  )
}

export function UfcInlinePricingBlock({ lockedCount }: { lockedCount?: number }) {
  return (
    <li className="border-t border-[#c9b896]/25 bg-gradient-to-br from-[#16120e] via-[#100e0c] to-[#0a0908] px-5 py-6 sm:px-7 sm:py-7">
      <UfcPricingCtaContent lockedCount={lockedCount} />
    </li>
  )
}
