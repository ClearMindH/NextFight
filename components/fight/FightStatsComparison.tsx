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
  compact?: boolean
}

export function FightStatsComparison({ red, blue, compact = false }: FightStatsComparisonProps) {
  const rows = buildStatComparisons(red, blue)

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card/50',
        compact ? 'p-4 sm:p-5' : 'rounded-3xl p-6 sm:p-8',
      )}
    >
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2',
          compact ? 'mb-4' : 'mb-8',
        )}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Statistiques</p>
          <h2
            className={cn(
              'mt-1 font-display font-semibold tracking-tight',
              compact ? 'text-lg' : 'mt-2 text-2xl',
            )}
          >
            Comparaison statistique
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

      <div className={compact ? 'space-y-3' : 'space-y-5'}>
        {rows.map((row, i) => (
          <StatRow
            key={row.key}
            row={row}
            redName={red.name}
            blueName={blue.name}
            index={i}
            compact={compact}
          />
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
  compact,
}: {
  row: StatComparisonRow
  redName: string
  blueName: string
  index: number
  compact: boolean
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
      <div className={cn('rounded-full overflow-hidden bg-border flex', compact ? 'h-1.5' : 'h-2')}>
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
