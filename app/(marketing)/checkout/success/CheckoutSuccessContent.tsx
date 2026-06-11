'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { SubscriptionStatusResponse } from '@/types/subscription'
import { planDisplayName } from '@/lib/subscription-constants'
import { applySubscriptionStatus } from '@/hooks/useSubscription'

type VerifyResponse = SubscriptionStatusResponse & { magicLinkSent?: boolean }

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<VerifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Session manquante')
      setLoading(false)
      return
    }

    let attempts = 0

    async function verify(): Promise<void> {
      attempts += 1
      const res = await fetch(
        `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId!)}`,
        { credentials: 'include', cache: 'no-store' },
      )
      const data = (await res.json()) as VerifyResponse & { error?: string }

      if (res.status === 503 && attempts < 4) {
        await new Promise((r) => setTimeout(r, 1000))
        return verify()
      }

      if (!res.ok) throw new Error(data.error ?? 'Verification failed')
      if (!data.isPremium) throw new Error('Activation Premium en cours — réessayez.')

      setStatus(data)
      applySubscriptionStatus(data)
    }

    verify()
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
          <p className="mt-4 text-sm text-[#8a8278]">
            Déjà payé ? Allez sur{' '}
            <Link href="/login" className="text-gold hover:underline">
              la connexion
            </Link>{' '}
            avec l&apos;email utilisé lors du paiement (Apple Pay, Link ou carte).
          </p>
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
          {status.email && (
            <p className="mt-2 text-sm text-[#8a8278]">
              Accès lié à{' '}
              <span className="text-foreground">{status.email}</span>
              {status.magicLinkSent
                ? ' — un lien de connexion a aussi été envoyé par email (vérifiez les spams).'
                : ' (vérifiez les spams pour l’email de confirmation).'}
            </p>
          )}
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
