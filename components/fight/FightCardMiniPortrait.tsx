'use client'

import type { Fighter } from '@/types'
import { getCountryFlagEmoji } from '@/lib/country-flag'
import { cn } from '@/utils/cn'

type FightCardMiniPortraitProps = {
  fighter: Fighter
  corner: 'red' | 'blue'
}

export function FightCardMiniPortrait({ fighter, corner }: FightCardMiniPortraitProps) {
  const ring = corner === 'red' ? 'ring-red-500/40' : 'ring-blue-500/40'
  const flag = getCountryFlagEmoji(fighter.country)

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card ring-1 text-xl leading-none',
        ring,
      )}
      title={fighter.name}
      aria-hidden
    >
      {flag}
    </div>
  )
}
