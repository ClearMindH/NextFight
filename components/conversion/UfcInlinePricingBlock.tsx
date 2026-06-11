'use client'

import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

const VALUE_POINTS = [
  'Toutes les organisations (UFC, PFL, KSW, ARES, Hexagone)',
  'Modèle statistique + facteurs décisifs par combat',
  'Bilan transparent et historique vérifiable',
] as const

type UfcPricingCtaContentProps = {
  lockedCount?: number
  className?: string
}

export function UfcPricingCtaContent({
  lockedCount,
  className,
}: UfcPricingCtaContentProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9b896]">
        Accès Premium
      </p>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
        {lockedCount != null && lockedCount > 0
          ? `Débloquez les ${lockedCount} autres analyses de la carte`
          : 'Débloquez toute la carte'}
      </p>
      <p className="mt-1 text-sm text-[#8a8278]">À partir de 9,99€/mois · annulation libre</p>
      <ul className="mt-4 space-y-2">
        {VALUE_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-[#c8c0b4]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
}

/** CTA principal au-dessus de la ligne de flottaison — juste après le co-main gratuit. */
export function UfcPrimaryCtaSection({ lockedCount }: UfcPrimaryCtaSectionProps) {
  const { isPremium } = useSubscription()

  if (isPremium || lockedCount <= 0) return null

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
