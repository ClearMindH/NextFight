'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { cn } from '@/utils/cn'

interface PremiumGateProps {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
  blur?: boolean
}

export function PremiumGate({
  title = 'Contenu Premium',
  description = 'Passez à Premium pour débloquer cette fonctionnalité.',
  className,
  children,
  blur = true,
}: PremiumGateProps) {
  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      {children && (
        <div className={cn(blur && 'blur-sm pointer-events-none select-none opacity-40')}>
          {children}
        </div>
      )}
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center p-8',
          children ? 'absolute inset-0 bg-background/70 backdrop-blur-[2px]' : 'border border-gold/20 bg-card/80 py-12',
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted max-w-sm">{description}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <StripeCheckoutButton planId="premium_monthly" highlighted className="flex-1">
            Premium 9,99€/mois
          </StripeCheckoutButton>
          <Link
            href="/pricing"
            className="flex-1 rounded-full border border-border py-2.5 text-sm text-center hover:border-gold/40 transition-colors"
          >
            Voir les offres
          </Link>
        </div>
      </div>
    </div>
  )
}
