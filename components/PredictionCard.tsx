'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Fight } from '@/types'
import { FighterPortrait } from '@/components/fight/FighterPortrait'
import { FightAnalysisPanel } from '@/components/FightAnalysisPanel'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'

interface PredictionCardProps {
  fight: Fight
  organizationLabel?: string
  className?: string
  /** Load detailed narrative on demand (Premium) */
  showAnalysis?: boolean
  eventName?: string
}

export function PredictionCard({
  fight,
  organizationLabel = 'UFC Main Event',
  className,
  showAnalysis = false,
  eventName,
}: PredictionCardProps) {
  const redProb = fight.model.redWinProbability
  const blueProb = 100 - redProb

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className={cn(
        'rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-gold">{organizationLabel}</p>
      <p className="mt-2 text-center text-sm text-muted">{fight.weightClass}</p>

      <div className="mt-4">
        <PredictionVerdictBanner fight={fight} />
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-6 sm:grid-cols-2 sm:gap-4">
        <FighterPortrait
          fighter={fight.redCorner}
          corner="red"
          probability={redProb}
        />
        <FighterPortrait
          fighter={fight.blueCorner}
          corner="blue"
          probability={blueProb}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 text-center">
        <Metric label="Confiance" value={formatPercent(fight.model.confidence)} highlight />
      </div>

      <FastLink
        href={`/fight/${fight.id}`}
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gold hover:underline underline-offset-4"
      >
        Full fight breakdown
        <ArrowUpRight className="h-3.5 w-3.5" />
      </FastLink>

      {showAnalysis && (
        <FightAnalysisPanel fight={fight} eventName={eventName} />
      )}
    </motion.article>
  )
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className={cn('mt-1 text-sm font-medium', highlight && 'text-gold')}>{value}</p>
    </div>
  )
}
