'use client'

import { useEffect, useState } from 'react'
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
  /** Carte réduite — pages pronostics org (face-à-face, moins de scroll). */
  compact?: boolean
}

export function FighterPortrait({
  fighter,
  corner,
  probability,
  className,
  compact = false,
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
    <div className={cn('relative flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative w-full rounded-2xl border text-center',
          compact ? 'max-w-none px-3 py-3.5 sm:px-4 sm:py-4' : 'max-w-[280px] px-6 py-8',
          isRed
            ? 'border-red-500/35 border-l-4 border-l-red-500/80 bg-red-500/[0.06]'
            : 'border-blue-500/35 border-l-4 border-l-blue-500/80 bg-blue-500/[0.06]',
        )}
      >
        {rankingBadge && (
          <div
            className={cn(
              'absolute flex items-center justify-center rounded-lg border font-display font-bold tabular-nums',
              compact
                ? 'top-2 right-2 h-6 min-w-[1.75rem] px-1.5 text-[10px]'
                : 'top-3 right-3 h-8 min-w-[2.25rem] px-2 text-xs',
              isRed
                ? 'border-red-400/50 bg-red-600/90 text-white'
                : 'border-blue-400/50 bg-blue-600/90 text-white',
            )}
            aria-label={`Classement division : ${rankingBadge}`}
          >
            {rankingBadge}
          </div>
        )}

        {!compact && (
          <p
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.2em]',
              isRed ? 'text-red-400/90' : 'text-blue-400/90',
            )}
          >
            {isRed ? 'Coin rouge' : 'Coin bleu'}
          </p>
        )}

        <p
          className={cn(
            'leading-none',
            compact ? 'mt-1 text-2xl sm:text-3xl' : 'mt-4 text-4xl sm:text-5xl',
          )}
          aria-hidden
        >
          {flag}
        </p>

        <h2
          className={cn(
            'font-display font-semibold tracking-tight text-foreground',
            compact
              ? 'mt-2 text-sm leading-tight sm:text-base'
              : 'mt-4 text-xl sm:text-2xl',
          )}
        >
          {displayFighter.name}
        </h2>

        {nickname && !compact && (
          <p className="mt-2 text-sm italic leading-snug text-gold/90">&ldquo;{nickname}&rdquo;</p>
        )}

        <p
          className={cn(
            'font-semibold tabular-nums text-[#f5f2eb]',
            compact ? 'mt-1.5 text-xs sm:text-sm' : 'mt-3 text-base',
          )}
        >
          {displayFighter.record}
        </p>

        {countryLabel && !compact && (
          <p className="mt-1 text-xs text-muted">{countryLabel}</p>
        )}
      </div>

      {probability != null && (
        <div className={cn('text-center', compact ? 'mt-2' : 'mt-4')}>
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider',
              isRed ? 'text-red-400/80' : 'text-blue-400/80',
            )}
          >
            Probabilité
          </p>
          <p
            className={cn(
              'font-display font-bold tabular-nums',
              compact ? 'text-2xl sm:text-3xl' : 'text-3xl',
              isRed ? 'text-red-400' : 'text-blue-400',
            )}
          >
            {Math.round(probability)}%
          </p>
        </div>
      )}
    </div>
  )
}
