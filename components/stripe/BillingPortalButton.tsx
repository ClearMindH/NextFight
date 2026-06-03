'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface BillingPortalButtonProps {
  className?: string
  children: React.ReactNode
}

export function BillingPortalButton({ className, children }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Portal unavailable')
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
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60',
          className,
        )}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        ) : (
          children
        )}
      </button>
      {error && <p className="mt-2 text-xs text-red-400/90">{error}</p>}
    </div>
  )
}
