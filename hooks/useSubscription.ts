'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SubscriptionStatusResponse } from '@/types/subscription'

const FREE_DEFAULT: SubscriptionStatusResponse = {
  email: null,
  plan: 'free',
  isPremium: false,
  status: 'inactive',
  currentPeriodEnd: null,
  features: {
    allPredictions: false,
    detailedAnalysis: false,
    history: false,
    advancedComparator: false,
  },
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatusResponse>(FREE_DEFAULT)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' })
      if (res.ok) {
        setStatus(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { status, loading, refresh, isPremium: status.isPremium }
}
