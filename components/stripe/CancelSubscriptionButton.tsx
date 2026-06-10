'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

interface CancelSubscriptionButtonProps {
  className?: string
  /** Abonnement sans Stripe (grant admin) — annulation immédiate. */
  manualBilling?: boolean
  /** Renouvellement déjà désactivé. */
  alreadyScheduled?: boolean
}

export function CancelSubscriptionButton({
  className,
  manualBilling = false,
  alreadyScheduled = false,
}: CancelSubscriptionButtonProps) {
  const { refresh } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (alreadyScheduled || done) {
    return (
      <p className="text-center text-xs text-[#8a8278]">
        Annulation enregistrée. Votre accès Premium reste actif jusqu’à la fin de la période payée.
      </p>
    )
  }

  async function handleCancel() {
    const label = manualBilling
      ? 'Confirmer la fin de l’accès Premium ?'
      : 'Annuler le renouvellement automatique ? Vous gardez l’accès Premium jusqu’à la fin de la période en cours.'
    if (!window.confirm(label)) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate: manualBilling }),
      })
      const data = (await res.json()) as { error?: string; isPremium?: boolean }
      if (!res.ok) {
        setError(data.error ?? 'Annulation impossible')
        return
      }
      setDone(true)
      await refresh()
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className={cn(
          'w-full rounded-xl border border-[#3d2a2a] px-4 py-3 text-sm text-[#d4a5a5] transition-colors hover:border-[#5c3d3d] hover:bg-[#1a1010] disabled:opacity-60',
          className,
        )}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Annulation…
          </span>
        ) : manualBilling ? (
          'Annuler l’abonnement'
        ) : (
          'Annuler le renouvellement'
        )}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400/90">{error}</p>}
    </div>
  )
}
