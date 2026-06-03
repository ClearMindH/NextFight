'use client'

import type { FighterScoreProfile } from '@/types/prediction'
import { cn } from '@/utils/cn'

const DIMENSIONS: { key: keyof Omit<FighterScoreProfile, 'compositeScore'>; label: string }[] =
  [
    { key: 'striking', label: 'Striking' },
    { key: 'grappling', label: 'Grappling' },
    { key: 'physical', label: 'Physical' },
    { key: 'momentum', label: 'Momentum' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'recentForm', label: 'Forme récente' },
  ]

interface PredictionBreakdownProps {
  redName: string
  blueName: string
  red: FighterScoreProfile
  blue: FighterScoreProfile
  className?: string
}

export function PredictionBreakdown({
  redName,
  blueName,
  red,
  blue,
  className,
}: PredictionBreakdownProps) {
  return (
    <div className={cn('mt-5 border-t border-border pt-5', className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-4">
        Détail des scores
      </p>
      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionRow
            key={key}
            label={label}
            redName={redName}
            blueName={blueName}
            redScore={red[key]}
            blueScore={blue[key]}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted">
        <span>
          Composite: <span className="text-gold tabular-nums">{pct(red.compositeScore)}</span>
        </span>
        <span>
          Composite: <span className="text-gold tabular-nums">{pct(blue.compositeScore)}</span>
        </span>
      </div>
    </div>
  )
}

function DimensionRow({
  label,
  redName,
  blueName,
  redScore,
  blueScore,
}: {
  label: string
  redName: string
  blueName: string
  redScore: number
  blueScore: number
}) {
  const total = redScore + blueScore || 1
  const redShare = (redScore / total) * 100

  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted mb-1">
        <span className="truncate max-w-[40%]" title={redName}>
          {label}
        </span>
        <span className="truncate max-w-[40%] text-right" title={blueName}>
          {pct(redScore)} · {pct(blueScore)}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-border">
        <div
          className="h-full bg-gradient-to-r from-gold/70 to-gold transition-all"
          style={{ width: `${redShare}%` }}
        />
        <div className="h-full flex-1 bg-muted/30" />
      </div>
    </div>
  )
}

function pct(score: number): string {
  return `${Math.round(score * 100)}%`
}
