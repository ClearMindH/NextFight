'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { SubscriptionStatusResponse } from '@/types/subscription'
import { planDisplayName } from '@/lib/subscription-constants'

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Session manquante')
      setLoading(false)
      return
    }

    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Verification failed')
        setStatus(data)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div className="container-content section-padding max-w-lg mx-auto text-center">
      {loading && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
          <p className="mt-4 text-muted text-sm">Activation de votre abonnement…</p>
        </>
      )}

      {!loading && error && (
        <>
          <h1 className="font-display text-2xl font-semibold">Erreur</h1>
          <p className="mt-3 text-muted text-sm">{error}</p>
          <Link href="/account" className="mt-8 inline-block text-gold text-sm hover:underline">
            Mon compte →
          </Link>
        </>
      )}

      {!loading && status?.isPremium && (
        <>
          <CheckCircle className="h-14 w-14 text-gold mx-auto" />
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
            Bienvenue en Premium
          </h1>
          <p className="mt-3 text-muted">
            Plan actif : <span className="text-foreground">{planDisplayName(status.plan)}</span>
          </p>
          <ul className="mt-8 text-sm text-muted text-left space-y-2 max-w-xs mx-auto">
            <li>✓ Tous les pronostics détaillés</li>
            <li>✓ Analyse détaillée par combat</li>
            <li>✓ Fiches combat Premium</li>
          </ul>
          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/ufc-pronostics"
              className="rounded-full bg-foreground text-background py-3 text-sm font-medium hover:scale-[1.02] transition-transform"
            >
              Voir les pronostics
            </Link>
            <Link href="/account" className="text-sm text-gold hover:underline">
              Gérer mon compte
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
