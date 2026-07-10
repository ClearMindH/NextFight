'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { PlanId } from '@/types/subscription'
import { isPaidPlan } from '@/lib/stripe-plans'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

interface StripeCheckoutButtonProps {
  planId: PlanId
  className?: string
  children: React.ReactNode
  highlighted?: boolean
  /** Page de retour après connexion (défaut : page actuelle). */
  loginNext?: string
}

export function StripeCheckoutButton({
  planId,
  className,
  children,
  highlighted,
  loginNext,
}: StripeCheckoutButtonProps) {
  const pathname = usePathname()
  const { status, loading, isPremium } = useSubscription()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const returnPath = loginNext ?? pathname ?? '/pricing'
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`

  async function handleClick() {
    if (!isPaidPlan(planId)) return

    setCheckoutLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      })

      const data = (await res.json()) as { url?: string; error?: string; code?: string }

      if (res.status === 401 || data.code === 'AUTH_REQUIRED') {
        window.location.href = loginHref
        return
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Checkout unavailable')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (!isPaidPlan(planId)) return null

  if (loading) {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          className={cn(
            'w-full rounded-full py-2.5 text-center text-sm font-medium opacity-60',
            highlighted
              ? 'bg-foreground text-background'
              : 'border border-border',
            className,
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </span>
        </button>
      </div>
    )
  }

  if (isPremium) {
    return (
      <Link
        href="/account"
        className={cn(
          'block w-full rounded-full py-2.5 text-center text-sm font-medium transition-all',
          highlighted
            ? 'bg-foreground text-background hover:scale-[1.02]'
            : 'border border-border hover:border-gold/40',
          className,
        )}
      >
        Gérer mon abonnement →
      </Link>
    )
  }

  if (!status.email) {
    return (
      <div className="w-full">
        <Link
          href={loginHref}
          className={cn(
            'block w-full rounded-full py-2.5 text-center text-sm font-medium transition-all',
            highlighted
              ? 'bg-foreground text-background hover:scale-[1.02]'
              : 'border border-border hover:border-gold/40',
            className,
          )}
        >
          Se connecter pour passer Premium →
        </Link>
        <p className="mt-2 text-center text-[10px] text-[#8a8278]">
          Lien magique par email · puis paiement sécurisé Stripe
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={checkoutLoading}
        className={cn(
          'w-full rounded-full py-2.5 text-center text-sm font-medium transition-all disabled:opacity-60',
          highlighted
            ? 'bg-foreground text-background hover:scale-[1.02]'
            : 'border border-border hover:border-gold/40',
          className,
        )}
      >
        {checkoutLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirection…
          </span>
        ) : (
          children
        )}
      </button>
      <p className="mt-2 text-center text-[10px] text-[#6b6560]">
        Compte : {status.email}
      </p>
      {error && <p className="mt-2 text-xs text-red-400/90 text-center">{error}</p>}
    </div>
  )
}
