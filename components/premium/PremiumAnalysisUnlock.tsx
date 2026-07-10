'use client'

import { PREMIUM_ANALYSIS_FEATURES } from '@/lib/prediction-factors'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

type PremiumAnalysisUnlockProps = {
  className?: string
  showPricingHint?: boolean
}

export function PremiumAnalysisUnlock({
  className,
  showPricingHint = true,
}: PremiumAnalysisUnlockProps) {
  const { isPremium } = useSubscription()

  if (isPremium) return null

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#c9b896]/25 bg-gradient-to-b from-[#12100e] to-[#080808] px-5 py-6 sm:px-7 sm:py-7',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9b896]">
        Ce que contient l&apos;analyse Premium
      </p>
      <ul className="mt-4 space-y-2.5">
        {PREMIUM_ANALYSIS_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-[#c8c0b4]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8a8278]" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <StripeCheckoutButton planId="premium_monthly" highlighted className="sm:max-w-xs">
          Débloquer cette analyse
        </StripeCheckoutButton>
        <Link
          href="/pricing"
          className="text-center text-sm text-[#8a8278] transition-colors hover:text-[#c9b896] sm:text-left"
        >
          Comparer les offres →
        </Link>
      </div>

      {showPricingHint && (
        <p className="mt-3 text-[11px] text-[#5c5c5c]">
          Toutes les cartes UFC du mois · à partir de 4,99€/mois
        </p>
      )}
    </div>
  )
}
