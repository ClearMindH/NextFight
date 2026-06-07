import { buildPredictionVerdict } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'
import { cn } from '@/utils/cn'

type PredictionVerdictBannerProps = {
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner' | 'scheduledRounds'>
  /** compact = liste carte ; default = page combat */
  variant?: 'default' | 'compact' | 'prominent'
  className?: string
  showProbability?: boolean
}

export function PredictionVerdictBanner({
  fight,
  variant = 'default',
  className,
  showProbability = true,
}: PredictionVerdictBannerProps) {
  const { headline, probabilityLine } = buildPredictionVerdict(fight, {
    includeProbability: showProbability,
  })

  if (variant === 'compact') {
    return (
      <p className={cn('text-sm font-medium text-gold-soft', className)}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted mr-2">
          Pronostic
        </span>
        {headline}
        {probabilityLine && (
          <span className="ml-2 text-xs font-normal tabular-nums text-muted">
            · {probabilityLine}
          </span>
        )}
      </p>
    )
  }

  if (variant === 'prominent') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent px-5 py-4 text-center',
          className,
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/90">
          Pronostic NextFight
        </p>
        <p className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {headline}
        </p>
        {probabilityLine && (
          <p className="mt-1.5 text-sm tabular-nums text-muted">{probabilityLine}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-surface/60 px-4 py-3 text-center sm:px-5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Pronostic
      </p>
      <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{headline}</p>
      {probabilityLine && (
        <p className="mt-1 text-xs tabular-nums text-muted">{probabilityLine}</p>
      )}
    </div>
  )
}
