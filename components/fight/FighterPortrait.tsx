'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Fighter } from '@/types'
import { applyFighterDisplayPatch } from '@/lib/fighter-display-client'
import { getDivisionRankingBadge } from '@/lib/fighter-ranking'
import { getCountryFlagEmoji, formatCountryLabel } from '@/lib/country-flag'
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
  const [displayFighter, setDisplayFighter] = useState(() => applyFighterDisplayPatch(fighter))
  const isRed = corner === 'red'
  const rankingBadge = getDivisionRankingBadge(displayFighter.ranking)
  const nickname = formatFighterNickname(displayFighter.nickname)
  const flag = getCountryFlagEmoji(displayFighter.country)
  const countryLabel = formatCountryLabel(displayFighter.country)

  useEffect(() => {
    setDisplayFighter(applyFighterDisplayPatch(fighter))
  }, [fighter])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/fighters/${fighter.id}/display`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: {
          ranking?: number | null
          record?: string
          nickname?: string | null
        } | null) => {
          if (cancelled || !data) return
          setDisplayFighter((prev) =>
            applyFighterDisplayPatch(prev, {
              ranking: data.ranking ?? prev.ranking,
              record: data.record ?? prev.record,
              nickname: data.nickname ?? prev.nickname,
            }),
          )
        },
      )
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fighter.id, fighter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: isRed ? 0 : 0.1 }}
      className={cn('relative flex flex-col items-center', className)}
    >
      <div
        className={cn(
          'relative w-full max-w-[280px] rounded-2xl border px-6 py-8 text-center',
          isRed
            ? 'border-red-500/35 border-l-4 border-l-red-500/80 bg-red-500/[0.06]'
            : 'border-blue-500/35 border-l-4 border-l-blue-500/80 bg-blue-500/[0.06]',
        )}
      >
        {rankingBadge && (
          <div
            className={cn(
              'absolute top-3 right-3 flex h-8 min-w-[2.25rem] items-center justify-center',
              'rounded-lg border px-2 font-display text-xs font-bold tabular-nums',
              isRed
                ? 'border-red-400/50 bg-red-600/90 text-white'
                : 'border-blue-400/50 bg-blue-600/90 text-white',
            )}
            aria-label={`Classement division : ${rankingBadge}`}
          >
            {rankingBadge}
          </div>
        )}

        <p
          className={cn(
            'text-[10px] font-medium uppercase tracking-[0.2em]',
            isRed ? 'text-red-400/90' : 'text-blue-400/90',
          )}
        >
          {isRed ? 'Coin rouge' : 'Coin bleu'}
        </p>

        <p className="mt-4 text-4xl leading-none sm:text-5xl" aria-hidden>
          {flag}
        </p>

        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {displayFighter.name}
        </h2>

        {nickname && (
          <p className="mt-2 text-sm italic leading-snug text-gold/90">&ldquo;{nickname}&rdquo;</p>
        )}

        <p className="mt-3 text-base font-semibold tabular-nums text-[#f5f2eb]">
          {displayFighter.record}
        </p>

        {countryLabel && (
          <p className="mt-1 text-xs text-muted">{countryLabel}</p>
        )}
      </div>

      {probability != null && (
        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">Probabilité</p>
          <p className="font-display text-3xl font-semibold tabular-nums text-gold">
            {Math.round(probability)}%
          </p>
        </div>
      )}
    </motion.div>
  )
}
