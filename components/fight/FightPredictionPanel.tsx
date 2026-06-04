'use client'

import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Crosshair, Shield, Target, Trophy } from 'lucide-react'
import type { Fight } from '@/types'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { methodLabels, formatPercent, formatPredictedRound } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FightPredictionPanelProps {
  fight: Fight
}

export function FightPredictionPanel({ fight }: FightPredictionPanelProps) {
  const { model, redCorner, blueCorner } = fight
  const redProb = model.redWinProbability
  const blueProb = 100 - redProb
  const favorite =
    redProb >= blueProb
      ? { name: redCorner.name, prob: redProb }
      : { name: blueCorner.name, prob: blueProb }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold/5 p-6 sm:p-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
          Moteur statistique
        </p>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Pronostic du combat
        </h2>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Probabilités calculées uniquement par le moteur NextFight à partir des stats roster.
        </p>

        <div className="mt-6 max-w-lg">
          <PredictionVerdictBanner fight={fight} variant="prominent" />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PredictionMetric
            icon={Trophy}
            label="Vainqueur prévu"
            value={favorite.name}
            highlight
          />
          <PredictionMetric
            icon={Target}
            label="Probabilité"
            value={formatPercent(favorite.prob)}
          />
          <PredictionMetric
            icon={Crosshair}
            label="Méthode"
            value={methodLabels[model.predictedMethod]}
          />
          <PredictionMetric
            icon={Shield}
            label="Confiance"
            value={formatPercent(model.confidence)}
            sub={formatPredictedRound(
              model.predictedMethod,
              model.predictedRound,
              fight.scheduledRounds,
            )}
          />
        </div>

        <div className="mt-8 flex h-3 rounded-full overflow-hidden bg-border">
          <div
            className="h-full bg-gradient-to-r from-red-500/80 to-red-400/60 transition-all"
            style={{ width: `${redProb}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-blue-400/60 to-blue-500/80 transition-all"
            style={{ width: `${blueProb}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
          <span>{redCorner.name} {formatPercent(redProb)}</span>
          <span>{blueCorner.name} {formatPercent(blueProb)}</span>
        </div>
      </div>
    </motion.section>
  )
}

function PredictionMetric({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-background/40 p-4',
        highlight && 'border-gold/30 bg-gold/5',
      )}
    >
      <Icon className="h-4 w-4 text-gold mb-3" />
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm font-medium leading-snug',
          highlight && 'text-gold font-display text-lg',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] text-muted">{sub}</p>}
    </div>
  )
}
