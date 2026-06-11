'use client'

import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { Check } from 'lucide-react'
import Link from 'next/link'

const VALUE_POINTS = [
  'Toutes les organisations (UFC, PFL, KSW, ARES, Hexagone)',
  'Modèle statistique + facteurs décisifs par combat',
  'Bilan transparent et historique vérifiable',
] as const

export function UfcInlinePricingBlock() {
  return (
    <li className="border-t border-[#c9b896]/25 bg-gradient-to-br from-[#16120e] via-[#100e0c] to-[#0a0908] px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9b896]">
        Accès Premium
      </p>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
        À partir de 9,99€/mois
      </p>
      <ul className="mt-4 space-y-2">
        {VALUE_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-[#c8c0b4]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <StripeCheckoutButton planId="premium_monthly" highlighted className="sm:max-w-xs">
          Débloquer toutes les analyses →
        </StripeCheckoutButton>
        <Link
          href="/pricing"
          className="text-center text-sm text-[#8a8278] transition-colors hover:text-[#c9b896] sm:text-left"
        >
          Comparer mensuel / annuel →
        </Link>
      </div>
    </li>
  )
}
