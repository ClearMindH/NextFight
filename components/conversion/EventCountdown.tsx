'use client'

import { useEffect, useState } from 'react'
import {
  getUfcFreedom250EventStart,
  isEventCountdownActive,
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

function getParts(targetMs: number, nowMs: number): CountdownParts | null {
  const diff = targetMs - nowMs
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
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-[#8a8278] sm:text-[10px]">
        {label}
      </p>
    </div>
  )
}

export function EventCountdown({ className, variant = 'default' }: EventCountdownProps) {
  const [parts, setParts] = useState<CountdownParts | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const targetMs = getUfcFreedom250EventStart().getTime()

    const tick = () => {
      const now = new Date()
      setVisible(isEventCountdownActive(now))
      setParts(getParts(targetMs, now.getTime()))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!visible || !parts) return null

  const compact = variant === 'compact'

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#0a0a0a]',
        compact
          ? 'border-[#B91C1C]/30 bg-gradient-to-br from-[#1a0a0a] to-[#0a0a0a] px-3 py-3'
          : 'rounded-2xl border-[#B91C1C]/25 bg-gradient-to-b from-[#140a0a] to-[#0a0a0a] px-5 py-5 shadow-[0_0_32px_-12px_rgba(185,28,28,0.35)] sm:px-8',
        className,
      )}
    >
      <p
        className={cn(
          'font-medium uppercase tracking-[0.18em] text-[#e8a0a0]',
          compact ? 'text-center text-[9px]' : 'text-center text-xs tracking-[0.2em]',
        )}
      >
        {compact ? '⏱ UFC Freedom 250 dans' : '⏱ Carte principale UFC Freedom 250 dans'}
      </p>
      <div className={cn('grid grid-cols-4', compact ? 'mt-2 gap-1.5' : 'mt-4 gap-3 sm:gap-6')}>
        <Unit value={parts.days} label={compact ? 'J' : 'Jours'} compact={compact} />
        <Unit value={parts.hours} label={compact ? 'H' : 'Heures'} compact={compact} />
        <Unit value={parts.minutes} label={compact ? 'Min' : 'Minutes'} compact={compact} />
        <Unit value={parts.seconds} label={compact ? 'Sec' : 'Secondes'} compact={compact} />
      </div>
      <p
        className={cn(
          'text-center leading-snug text-[#8a8278]',
          compact ? 'mt-2 text-[9px]' : 'mt-3 text-[10px] sm:text-xs',
        )}
      >
        Coup d&apos;envoi · {UFC_FREEDOM_250_TIME_LABEL}
      </p>
    </div>
  )
}
