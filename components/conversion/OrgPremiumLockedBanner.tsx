'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { Event } from '@/types'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

type OrgPremiumLockedBannerProps = {
  event: Event
  className?: string
}

export function OrgPremiumLockedBanner({ event, className }: OrgPremiumLockedBannerProps) {
  const { isPremium, loading } = useSubscription()

  if (loading || isPremium) return null

  const freeFight = getFreePreviewFight(event)
  const lockedCount = event.fights.length - (freeFight ? 1 : 0)
  if (lockedCount <= 0) return null

  return (
    <div
      className={cn(
        'sticky z-40 border-y border-[#B91C1C]/35 bg-[#1a0a0a]/95 backdrop-blur-md',
        className,
      )}
      style={{ top: 'var(--site-header-h, 4rem)' }}
    >
      <div className="container-content flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm text-[#f5f2eb]">
          <Lock className="h-4 w-4 shrink-0 text-[#B91C1C]" aria-hidden />
          <span>
            {lockedCount} combat{lockedCount > 1 ? 's' : ''} verrouillé
            {lockedCount > 1 ? 's' : ''} sur cette carte · Débloquez tout pour 9,99€/mois
          </span>
        </p>
        <Link
          href="/pricing"
          className="shrink-0 rounded-full bg-[#B91C1C] px-5 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Passer Premium →
        </Link>
      </div>
    </div>
  )
}
