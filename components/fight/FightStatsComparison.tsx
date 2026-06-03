'use client'

import { motion } from 'framer-motion'
import type { Fighter } from '@/types'
import {
  buildStatComparisons,
  formatStatValue,
  statRedShare,
  type StatComparisonRow,
} from '@/lib/fight-stats'
import { cn } from '@/utils/cn'

interface FightStatsComparisonProps {
  red: Fighter
  blue: Fighter
}

export function FightStatsComparison({ red, blue }: FightStatsComparisonProps) {
  const rows = buildStatComparisons(red, blue)

  return (
    <section className="rounded-3xl border border-border bg-card/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Statistiques</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            Statistical comparison
          </h2>
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            {red.name}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted" />
            {blue.name}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <StatRow key={row.key} row={row} redName={red.name} blueName={blue.name} index={i} />
        ))}
      </div>
    </section>
  )
}

function StatRow({
  row,
  redName,
  blueName,
  index,
}: {
  row: StatComparisonRow
  redName: string
  blueName: string
  index: number
}) {
  const redShare = statRedShare(row.red, row.blue, row.higherIsBetter)
  const redWins = row.higherIsBetter ? row.red > row.blue : row.red < row.blue
  const blueWins = row.higherIsBetter ? row.blue > row.red : row.blue < row.red

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex justify-between text-xs mb-2">
        <span
          className={cn(
            'tabular-nums font-medium',
            redWins ? 'text-gold' : 'text-muted',
          )}
          title={redName}
        >
          {formatStatValue(row, row.red)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted">{row.label}</span>
        <span
          className={cn(
            'tabular-nums font-medium',
            blueWins ? 'text-gold' : 'text-muted',
          )}
          title={blueName}
        >
          {formatStatValue(row, row.blue)}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-border flex">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${redShare}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-gold/90 to-gold"
        />
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${100 - redShare}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-muted/40"
        />
      </div>
    </motion.div>
  )
}
