'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { SubscriptionStatusResponse } from '@/types/subscription'

const FREE_DEFAULT: SubscriptionStatusResponse = {
  email: null,
  plan: 'free',
  isPremium: false,
  status: 'inactive',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isManualBilling: false,
  features: {
    allPredictions: false,
    detailedAnalysis: false,
    history: false,
    advancedComparator: false,
  },
}

const PREMIUM_CACHE_KEY = 'nf_is_premium'

type SubscriptionSnapshot = {
  status: SubscriptionStatusResponse
  loading: boolean
}

/** Snapshot SSR stable — ne jamais recréer l’objet dans getServerSnapshot. */
const SERVER_SNAPSHOT: SubscriptionSnapshot = { status: FREE_DEFAULT, loading: true }

let snapshot: SubscriptionSnapshot = { status: FREE_DEFAULT, loading: true }
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function readCachedPremium(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(PREMIUM_CACHE_KEY) === '1'
  } catch {
    return false
  }
}

function writeCachedPremium(isPremium: boolean): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PREMIUM_CACHE_KEY, isPremium ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): SubscriptionSnapshot {
  return snapshot
}

async function fetchSubscriptionStatus(force = false): Promise<void> {
  if (inflight && !force) return inflight

  inflight = (async () => {
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' })
      if (res.ok) {
        const status = (await res.json()) as SubscriptionStatusResponse
        snapshot = { status, loading: false }
        writeCachedPremium(status.isPremium)
        emit()
        return
      }
    } catch {
      /* keep previous snapshot */
    }
    snapshot = { ...snapshot, loading: false }
    emit()
  })().finally(() => {
    inflight = null
  })

  return inflight
}

function ensureSubscriptionLoaded(): void {
  if (!inflight && snapshot.loading) {
    void fetchSubscriptionStatus()
  }
}

export function useSubscription() {
  const store = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT)

  const [stalePremium] = useState(readCachedPremium)

  useEffect(() => {
    ensureSubscriptionLoaded()
  }, [])

  const refresh = useCallback(async () => {
    snapshot = { ...snapshot, loading: true }
    emit()
    await fetchSubscriptionStatus(true)
  }, [])

  const isPremium = store.loading ? stalePremium : store.status.isPremium

  return {
    status: store.status,
    loading: store.loading,
    refresh,
    isPremium,
  }
}
