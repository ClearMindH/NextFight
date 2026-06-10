'use client'

import { Lock } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'

export function PremiumPreviewUnlock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505]/55 px-6">
      <Lock className="h-8 w-8 text-[#c9b896]" aria-hidden />
      <p className="mt-3 text-center text-sm font-medium text-[#f5f2eb]">
        Analyse complète Topuria vs Gaethje
      </p>
      <StripeCheckoutButton
        planId="premium_annual"
        highlighted
        className="mt-5 !rounded-full !px-8 !py-3 !text-sm !font-semibold"
      >
        Débloquer maintenant
      </StripeCheckoutButton>
    </div>
  )
}
