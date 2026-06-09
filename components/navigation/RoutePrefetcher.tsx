'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PREFETCH_ROUTES } from '@/lib/nav-routes'

type RoutePrefetcherProps = {
  /** Routes supplémentaires (ex. pages combat) — résolues côté serveur. */
  extraRoutes?: string[]
}

/** Précharge les pages clés dès que le navigateur est idle (une seule fois). */
export function RoutePrefetcher({ extraRoutes = [] }: RoutePrefetcherProps) {
  const router = useRouter()
  const didPrefetch = useRef(false)

  useEffect(() => {
    if (didPrefetch.current) return
    didPrefetch.current = true

    const routes = [...PREFETCH_ROUTES, ...extraRoutes]

    const prefetchAll = () => {
      for (const route of routes) {
        if (route.startsWith('/#')) continue
        router.prefetch(route)
      }
    }

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(prefetchAll, { timeout: 2500 })
      return () => cancelIdleCallback(id)
    }

    const t = setTimeout(prefetchAll, 400)
    return () => clearTimeout(t)
  }, [router, extraRoutes])

  return null
}
