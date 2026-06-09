'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/** Barre fine en haut de page — feedback immédiat au clic. */
export function NavigationProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const prevPath = useRef(pathname)

  useEffect(() => {
    const onNavigateIntent = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]')
      if (!anchor || anchor.getAttribute('target') === '_blank') return
      const href = anchor.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('/#')) return
      setActive(true)
    }
    document.addEventListener('pointerdown', onNavigateIntent, true)
    document.addEventListener('click', onNavigateIntent, true)
    return () => {
      document.removeEventListener('pointerdown', onNavigateIntent, true)
      document.removeEventListener('click', onNavigateIntent, true)
    }
  }, [])

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname
      setActive(false)
    }
  }, [pathname])

  if (!active) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-gold/15"
      aria-hidden
    >
      <div className="nav-progress-bar h-full w-2/5 bg-gold" />
    </div>
  )
}
