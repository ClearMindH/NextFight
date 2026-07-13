'use client'

import { useEffect, useState } from 'react'
import { FastLink } from '@/components/navigation/FastLink'
import {
  EVENT_URGENCY_BANNER_HEIGHT_PX,
  FEATURED_UFC_MAIN_EVENT_LABEL,
  isEventUrgencyBannerActive,
} from '@/lib/event-urgency'

export function EventUrgencyBanner() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isEventUrgencyBannerActive())
  }, [])

  useEffect(() => {
    const h = active ? `${EVENT_URGENCY_BANNER_HEIGHT_PX + 64}px` : '4rem'
    document.documentElement.style.setProperty('--site-header-h', h)
    return () => {
      document.documentElement.style.setProperty('--site-header-h', '4rem')
    }
  }, [active])

  if (!active) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center justify-center bg-[#B91C1C] px-3 text-center text-xs font-medium text-white sm:text-sm"
      role="region"
      aria-label="Événement à venir"
    >
      <p className="truncate sm:whitespace-normal">
        <span aria-hidden>🥊 </span>
        {FEATURED_UFC_MAIN_EVENT_LABEL} · samedi 18 juillet ·{' '}
        <FastLink
          href="/ufc-pronostics"
          className="underline underline-offset-2 transition-opacity hover:opacity-90"
        >
          Voir les pronostics →
        </FastLink>
      </p>
    </div>
  )
}
