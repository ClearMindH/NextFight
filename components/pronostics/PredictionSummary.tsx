import { buildPredictionSummaryLines } from '@/lib/prediction-summary'
import type { Fight } from '@/types'
import { cn } from '@/utils/cn'

type PredictionSummaryProps = {
  fight: Fight
  className?: string
  compact?: boolean
}

export function PredictionSummary({ fight, className, compact }: PredictionSummaryProps) {
  const lines = buildPredictionSummaryLines(fight)

  return (
    <div
      className={cn(
        'mx-auto max-w-3xl rounded-xl border border-[#c9b896]/20 bg-[#c9b896]/[0.05] px-4 py-3 sm:rounded-2xl sm:px-5 sm:py-4',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9b896]">
        Lecture du pronostic
      </p>
      <div className={cn('mt-2 space-y-1.5', compact && 'mt-1.5 space-y-1')}>
        {lines.map((line) => (
          <p
            key={line}
            className={cn(
              'leading-relaxed text-[#d4cdc0]',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
