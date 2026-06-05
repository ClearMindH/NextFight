'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Fighter } from '@/types'
import {
  getFighterPortraitUrl,
  isFighterPortraitPlaceholder,
} from '@/lib/fighter-portrait'
import { applyFighterDisplayPatch } from '@/lib/fighter-display-client'
import { canUseNextImage } from '@/lib/image-url'
import { cn } from '@/utils/cn'

type FightCardMiniPortraitProps = {
  fighter: Fighter
  corner: 'red' | 'blue'
}

export function FightCardMiniPortrait({ fighter, corner }: FightCardMiniPortraitProps) {
  const [src, setSrc] = useState(() => getFighterPortraitUrl(fighter))
  const placeholder = isFighterPortraitPlaceholder(src)
  const ring = corner === 'red' ? 'ring-red-500/40' : 'ring-blue-500/40'

  useEffect(() => {
    setSrc(getFighterPortraitUrl(fighter))
  }, [fighter])

  useEffect(() => {
    const initial = getFighterPortraitUrl(fighter)
    if (!isFighterPortraitPlaceholder(initial)) return
    let cancelled = false
    fetch(`/api/fighters/${fighter.id}/display`, { cache: 'force-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { imageUrl?: string | null } | null) => {
        if (cancelled || !data?.imageUrl) return
        const patched = applyFighterDisplayPatch(fighter, { imageUrl: data.imageUrl })
        const next = getFighterPortraitUrl(patched)
        if (!isFighterPortraitPlaceholder(next)) setSrc(next)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fighter])

  return (
    <div
      className={cn(
        'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1',
        ring,
        isFighterPortraitPlaceholder(src) && 'bg-[#141a22]',
      )}
    >
      {canUseNextImage(src) ? (
        <Image src={src} alt="" width={48} height={48} className="h-full w-full object-cover object-top" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover object-top" />
      )}
    </div>
  )
}
