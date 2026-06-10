'use client'

import { useEffect, useState } from 'react'
import {
  isEventCountdownActive,
  UFC_FREEDOM_250_EVENT_START,
  UFC_FREEDOM_250_TIME_LABEL,
} from '@/lib/event-urgency'
import { cn } from '@/utils/cn'

type EventCountdownProps = {
  className?: string
  variant?: 'default' | 'compact'
}

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getParts(target: Date, now: Date): CountdownParts | null {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

function Unit({
  value,
  label,
  compact,
}: {
  value: number
  label: string
  compact?: boolean
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          'font-display font-semibold tabular-nums text-[#f5f2eb]',
          compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-[#8a8278] sm:text-[10px]">
        {label}
      </p>
    </div>
  )
}

export function EventCountdown({ className, variant = 'default' }: EventCountdownProps) {
  const [parts, setParts] = useState<CountdownParts | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setActive(isEventCountdownActive(now))
      setParts(getParts(UFC_FREEDOM_250_EVENT_START, now))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!active || !parts) return null

  const compact = variant === 'compact'

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#0a0a0a]',
        compact
          ? 'border-[#B91C1C]/30 bg-gradient-to-br from-[#1a0a0a] to-[#0a0a0a] px-3 py-3'
          : 'rounded-2xl border-[#1f1d1a] px-5 py-5 sm:px-8',
        className,
      )}
    >
      <p
        className={cn(
          'font-medium uppercase tracking-[0.18em] text-[#8a8278]',
          compact ? 'text-center text-[9px]' : 'text-center text-xs tracking-[0.2em]',
        )}
      >
        {compact ? '⏱ UFC Freedom 250 dans' : '⏱ L&apos;événement commence dans'}
      </p>
      <div className={cn('grid grid-cols-4', compact ? 'mt-2 gap-1.5' : 'mt-4 gap-3 sm:gap-6')}>
        <Unit value={parts.days} label="J" compact={compact} />
        <Unit value={parts.hours} label="H" compact={compact} />
        <Unit value={parts.minutes} label="Min" compact={compact} />
        <Unit value={parts.seconds} label="Sec" compact={compact} />
      </div>
      <p
        className={cn(
          'text-center leading-snug text-[#8a8278]',
          compact ? 'mt-2 text-[9px]' : 'mt-3 text-[10px]',
        )}
      >
        {UFC_FREEDOM_250_TIME_LABEL}
      </p>
    </div>
  )
}
