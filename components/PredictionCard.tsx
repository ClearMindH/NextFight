'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import type { Fight } from '@/types'
import { FighterPortrait } from '@/components/fight/FighterPortrait'
import { PredictionBreakdown } from '@/components/PredictionBreakdown'
import { FightAnalysisPanel } from '@/components/FightAnalysisPanel'
import { methodLabels, formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'

interface PredictionCardProps {
  fight: Fight
  organizationLabel?: string
  className?: string
  /** Show expandable per-dimension model scores */
  showBreakdown?: boolean
  /** Load detailed narrative on demand (Premium) */
  showAnalysis?: boolean
  eventName?: string
}

export function PredictionCard({
  fight,
  organizationLabel = 'UFC Main Event',
  className,
  showBreakdown = false,
  showAnalysis = false,
  eventName,
}: PredictionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = showBreakdown && fight.model.breakdown != null
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

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5 text-center">
        <Metric label="Method" value={methodLabels[fight.model.predictedMethod]} />
        <Metric label="Round" value={String(fight.model.predictedRound)} />
        <Metric label="Confidence" value={formatPercent(fight.model.confidence)} highlight />
      </div>

      <Link
        href={`/fight/${fight.id}`}
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gold hover:underline underline-offset-4"
      >
        Full fight breakdown
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>

      {hasBreakdown && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-muted hover:text-gold transition-colors"
          >
            {expanded ? 'Hide breakdown' : 'View breakdown'}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')}
            />
          </button>
          <AnimatePresence>
            {expanded && fight.model.breakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <PredictionBreakdown
                  redName={fight.redCorner.name}
                  blueName={fight.blueCorner.name}
                  red={fight.model.breakdown.red}
                  blue={fight.model.breakdown.blue}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

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
