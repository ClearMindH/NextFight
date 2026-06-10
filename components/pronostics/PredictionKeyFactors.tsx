import { getPredictionKeyFactors } from '@/lib/prediction-factors'
import type { Fight } from '@/types'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

type PredictionKeyFactorsProps = {
  fight: Fight
  className?: string
  compact?: boolean
  hideFooter?: boolean
}

export function PredictionKeyFactors({
  fight,
  className,
  compact,
  hideFooter,
}: PredictionKeyFactorsProps) {
  const factors = getPredictionKeyFactors(fight)

  return (
    <div
      className={cn(
        'mx-auto max-w-3xl rounded-xl border border-white/[0.08] bg-[#0c1219]/60 sm:rounded-2xl',
        compact ? 'px-3 py-3 sm:px-4' : 'px-4 py-4 sm:px-5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8278]">
        Facteurs principaux
      </p>
      {fight.model.adjustmentNote && (
        <p
          className={cn(
            'mt-2 rounded-lg border border-[#c9b896]/20 bg-[#c9b896]/[0.06] px-3 py-2 text-[11px] leading-relaxed text-[#d4cbb8]',
            compact && 'mt-1.5 px-2.5 py-1.5 text-[10px]',
          )}
        >
          {fight.model.adjustmentNote}
        </p>
      )}
      <ul className={cn('mt-3 space-y-2', compact && 'mt-2 space-y-1.5')}>
        {factors.map((factor) => (
          <li
            key={factor.label}
            className={cn(
              factor.detail ? 'space-y-0.5' : undefined,
              compact && 'text-xs',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between gap-3 text-sm',
                compact && 'text-xs',
              )}
            >
              <span className="flex min-w-0 items-center gap-2 text-[#c8c0b4]">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#c9b896]" aria-hidden />
                <span>{factor.label}</span>
              </span>
              <span
                className={cn(
                  'shrink-0 font-medium',
                  factor.leaderCorner === 'red' ? 'text-red-300/90' : 'text-blue-300/90',
                )}
              >
                {factor.leaderName}
              </span>
            </div>
            {factor.detail && (
              <p className="pl-5 text-[10px] leading-relaxed text-[#6f6a62] sm:pl-6">
                {factor.detail}
              </p>
            )}
          </li>
        ))}
      </ul>
      {!hideFooter && (
        <p className="mt-3 text-[10px] text-[#5c5c5c]">
          Détail chiffré et comparaison complète · Premium
        </p>
      )}
    </div>
  )
}
