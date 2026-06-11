'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

type UfcAboveFoldCtaProps = {
  lockedCount: number
  className?: string
}

/**
 * Bloc conversion above-the-fold — visible sans scroll, juste sous le H1.
 */
export function UfcAboveFoldCta({ lockedCount, className }: UfcAboveFoldCtaProps) {
  const { isPremium, loading } = useSubscription()

  if (!loading && isPremium) return null
  if (lockedCount <= 0) return null

  return (
    <div
      className={cn(
        'rounded-xl border border-[#ea580c]/50 bg-gradient-to-br from-[#B91C1C] via-[#c2410c] to-[#9a3412] px-4 py-4 shadow-[0_8px_32px_rgba(185,28,28,0.35)] sm:px-5 sm:py-5',
        className,
      )}
    >
      <p className="text-sm font-semibold leading-snug text-white sm:text-base">
        UFC Freedom 250 · Dimanche 15 juin ·{' '}
        <span className="text-[#ffedd5]">
          {lockedCount} analyse{lockedCount > 1 ? 's' : ''} disponible
          {lockedCount > 1 ? 's' : ''} maintenant
        </span>
      </p>
      <p className="mt-1.5 text-sm font-medium text-[#fed7aa]">
        9,99€/mois · Annulable à tout moment
      </p>
      <Link
        href="/pricing"
        className="mt-4 flex w-full items-center justify-center rounded-lg bg-white px-5 py-3.5 text-center text-sm font-bold text-[#0a0a0a] shadow-md transition-opacity hover:opacity-95 active:opacity-90 sm:text-base"
      >
        Débloquer les {lockedCount} analyses →
      </Link>
    </div>
  )
}
