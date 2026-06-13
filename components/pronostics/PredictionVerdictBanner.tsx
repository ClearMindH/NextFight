import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'
import { cn } from '@/utils/cn'

type PredictionVerdictBannerProps = {
  fight: Pick<Fight, 'model' | 'redCorner' | 'blueCorner' | 'scheduledRounds'>
  /** compact = liste carte ; inline = listes accueil ; default = page combat */
  variant?: 'default' | 'compact' | 'prominent' | 'inline'
  className?: string
  showProbability?: boolean
}

export function PredictionVerdictBanner({
  fight,
  variant = 'default',
  className,
  showProbability = true,
}: PredictionVerdictBannerProps) {
  const verdict = buildPredictionVerdict(fight, {
    includeProbability: showProbability,
  })
  const { headline, probabilityLine, winner, winnerProbability } = verdict

  if (variant === 'inline') {
    const lastName = fighterShortName(winner.name)
    return (
      <div className={cn('flex items-end justify-between gap-4', className)}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Pronostic
          </p>
          <p className="mt-1 font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl">
            <span className="text-gold">{lastName}</span>
            <span className="font-normal text-foreground/75"> vainqueur</span>
          </p>
        </div>
        {showProbability && (
          <span className="shrink-0 rounded-lg border border-gold/20 bg-gold/[0.08] px-3 py-1.5 font-display text-base font-semibold tabular-nums text-gold">
            {Math.round(winnerProbability)}%
          </span>
        )}
      </div>
    )
  }

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
        <p className="mt-1 text-sm font-semibold tabular-nums text-[#f5f2eb] sm:text-base">
          {probabilityLine}
        </p>
      )}
    </div>
  )
}
