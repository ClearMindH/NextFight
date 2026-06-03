'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { PlanId } from '@/types/subscription'
import { isPaidPlan } from '@/lib/stripe-plans'
import { cn } from '@/utils/cn'

interface StripeCheckoutButtonProps {
  planId: PlanId
  email?: string
  className?: string
  children: React.ReactNode
  highlighted?: boolean
}

export function StripeCheckoutButton({
  planId,
  email,
  className,
  children,
  highlighted,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!isPaidPlan(planId)) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email }),
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Checkout unavailable')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !isPaidPlan(planId)}
        className={cn(
          'w-full rounded-full py-2.5 text-center text-sm font-medium transition-all disabled:opacity-60',
          highlighted
            ? 'bg-foreground text-background hover:scale-[1.02]'
            : 'border border-border hover:border-gold/40',
          className,
        )}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirection…
          </span>
        ) : (
          children
        )}
      </button>
      {error && <p className="mt-2 text-xs text-red-400/90 text-center">{error}</p>}
    </div>
  )
}
