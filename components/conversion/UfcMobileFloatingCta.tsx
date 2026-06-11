'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'

type UfcMobileFloatingCtaProps = {
  lockedCount?: number
}

export function UfcMobileFloatingCta({ lockedCount = 6 }: UfcMobileFloatingCtaProps) {
  const { isPremium, loading } = useSubscription()

  if (loading || isPremium) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#B91C1C]/40 bg-[#B91C1C] p-3 md:hidden">
      <Link
        href="/pricing"
        className="block w-full rounded-lg bg-white py-3.5 text-center text-sm font-bold leading-snug text-[#0a0a0a]"
      >
        <span aria-hidden>🔓 </span>
        UFC Freedom 250 — Débloquer les {lockedCount} analyses · 9,99€/mois
      </Link>
    </div>
  )
}
