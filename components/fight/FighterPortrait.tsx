'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Fighter } from '@/types'
import {
  FIGHTER_PORTRAIT_PLACEHOLDER,
  getFighterPortraitUrl,
  isFighterPortraitPlaceholder,
} from '@/lib/fighter-portrait'
import { mergeSeedRanking } from '@/lib/roster-seed-rankings'
import { getDivisionRankingBadge } from '@/lib/fighter-ranking'
import { canUseNextImage } from '@/lib/image-url'
import { formatFighterNickname } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FighterPortraitProps {
  fighter: Fighter
  corner: 'red' | 'blue'
  probability?: number
  className?: string
}

export function FighterPortrait({
  fighter,
  corner,
  probability,
  className,
}: FighterPortraitProps) {
  const [displayFighter, setDisplayFighter] = useState(() => mergeSeedRanking(fighter))
  const [src, setSrc] = useState(() => getFighterPortraitUrl(fighter))
  const isRed = corner === 'red'
  const isPlaceholder = isFighterPortraitPlaceholder(src)
  const rankingBadge = getDivisionRankingBadge(displayFighter.ranking)
  const showRankOnPhoto = Boolean(rankingBadge)
  const nickname = formatFighterNickname(displayFighter.nickname)

  useEffect(() => {
    setDisplayFighter(mergeSeedRanking(fighter))
    setSrc(getFighterPortraitUrl(fighter))
  }, [fighter])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/fighters/${fighter.id}/display`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: {
          ranking?: number | null
          imageUrl?: string | null
          record?: string
          nickname?: string | null
        } | null) => {
          if (cancelled || !data) return
          setDisplayFighter((prev) =>
            mergeSeedRanking({
              ...prev,
              ranking: data.ranking ?? prev.ranking,
              imageUrl: data.imageUrl ?? prev.imageUrl,
              record: data.record ?? prev.record,
              nickname: data.nickname ?? prev.nickname,
            }),
          )
          if (data.imageUrl) setSrc(getFighterPortraitUrl({ ...fighter, imageUrl: data.imageUrl }))
        },
      )
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fighter.id, fighter])

  const imageClassName = cn(
    'absolute inset-0 h-full w-full',
    isPlaceholder
      ? 'object-contain object-center p-10 sm:p-12 opacity-90'
      : 'object-cover object-top',
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: isRed ? 0 : 0.1 }}
      className={cn('relative flex flex-col items-center', className)}
    >
      <div
        className={cn(
          'relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden',
          'border shadow-2xl shadow-black/40',
          isRed ? 'border-red-500/30' : 'border-blue-500/30',
          isPlaceholder && 'bg-[#141a22]',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#050505]/50 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className={cn(
            'absolute -inset-px rounded-3xl opacity-60 blur-xl z-0',
            isRed ? 'bg-red-500/20' : 'bg-blue-500/20',
          )}
        />
        {canUseNextImage(src) ? (
          <Image
            src={src}
            alt={displayFighter.name}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className={imageClassName}
            priority
            onError={() => setSrc(FIGHTER_PORTRAIT_PLACEHOLDER)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- domaines externes non listés dans next.config
          <img
            src={src}
            alt={displayFighter.name}
            className={imageClassName}
            onError={() => setSrc(FIGHTER_PORTRAIT_PLACEHOLDER)}
          />
        )}
        {showRankOnPhoto && (
          <div
            className={cn(
              'absolute top-3 right-3 z-50 flex h-9 min-w-[2.5rem] items-center justify-center',
              'rounded-lg border-2 px-2 font-display text-sm font-bold tabular-nums',
              'shadow-lg shadow-black/70 ring-2 ring-black/40',
              isRed
                ? 'border-red-300/80 bg-red-600/95 text-white'
                : 'border-blue-300/80 bg-blue-600/95 text-white',
            )}
            aria-label={`Classement division : ${rankingBadge}`}
          >
            {rankingBadge}
          </div>
        )}
      </div>

      <div className="mt-4 w-full max-w-[280px] text-center px-1">
        <p
          className={cn(
            'text-[10px] font-medium uppercase tracking-[0.2em]',
            isRed ? 'text-red-400/90' : 'text-blue-400/90',
          )}
        >
          {isRed ? 'Coin rouge' : 'Coin bleu'}
        </p>
        <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {displayFighter.name}
        </h2>
        {nickname && (
          <p className="mt-1.5 text-sm text-gold/90 italic leading-snug">&ldquo;{nickname}&rdquo;</p>
        )}
        <p className="mt-2 text-base font-semibold tabular-nums text-[#f5f2eb]">
          {displayFighter.record}
        </p>
      </div>

      {probability != null && (
        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">Probabilité</p>
          <p className="font-display text-3xl font-semibold text-gold tabular-nums">
            {Math.round(probability)}%
          </p>
        </div>
      )}
    </motion.div>
  )
}
