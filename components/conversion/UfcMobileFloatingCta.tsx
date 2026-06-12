'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'

type UfcMobileFloatingCtaProps = {
  lockedCount?: number
  /** N’apparaît qu’après scroll au-delà de cet élément (évite de masquer les pronos). */
  scrollAnchorId?: string
}

export function UfcMobileFloatingCta({
  lockedCount = 6,
  scrollAnchorId,
}: UfcMobileFloatingCtaProps) {
  const { isPremium } = useSubscription()
  const [visible, setVisible] = useState(!scrollAnchorId)

  useEffect(() => {
    if (isPremium || !scrollAnchorId) return

    const anchor = document.getElementById(scrollAnchorId)
    if (!anchor) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin: '0px', threshold: 0 },
    )

    observer.observe(anchor)
    return () => observer.disconnect()
  }, [isPremium, scrollAnchorId])

  if (isPremium || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#B91C1C]/40 bg-[#B91C1C] p-3 md:hidden">
      <Link
        href="/pricing"
        className="block w-full rounded-lg bg-white py-3.5 text-center text-sm font-bold leading-snug text-[#0a0a0a]"
      >
        <span aria-hidden>🔓 </span>
        UFC Freedom 250 — Débloquer les {lockedCount} analyses · 9,99€/mois
      </Link>
    </div>
  )
}
