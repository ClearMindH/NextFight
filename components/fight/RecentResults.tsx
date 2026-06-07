'use client'

import type { Fighter } from '@/types'
import type { BoutResult, FighterRecentBout } from '@/types/recent-form'
import { MAX_RECENT_BOUTS, RECENT_BOUTS_MAX_MONTHS } from '@/types/recent-form'
import { cn } from '@/utils/cn'

interface RecentResultsProps {
  red: Fighter
  blue: Fighter
}

/** Combats récents (< 2 ans), du plus récent au plus ancien, ≤ 5. */
function recentBouts(fighter: Fighter): FighterRecentBout[] {
  return (fighter.recentBouts ?? [])
    .filter((b) => b.monthsAgo <= RECENT_BOUTS_MAX_MONTHS)
    .sort((a, b) => a.monthsAgo - b.monthsAgo)
    .slice(0, MAX_RECENT_BOUTS)
}

const RESULT_META: Record<BoutResult, { short: string; label: string; className: string }> = {
  win: { short: 'V', label: 'Victoire', className: 'border-gold/40 bg-gold/10 text-gold' },
  loss: { short: 'D', label: 'Défaite', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
  draw: { short: 'N', label: 'Nul', className: 'border-white/15 bg-white/[0.06] text-muted' },
}

function whenLabel(monthsAgo: number): string {
  if (monthsAgo <= 1) return 'récent'
  if (monthsAgo < 12) return `il y a ${monthsAgo} mois`
  const years = Math.round(monthsAgo / 12)
  return years <= 1 ? 'il y a 1 an' : `il y a ${years} ans`
}

function FighterColumn({ fighter }: { fighter: Fighter }) {
  const bouts = recentBouts(fighter)

  return (
    <div>
      <p className="text-sm font-semibold tracking-tight">{fighter.name}</p>
      {bouts.length === 0 ? (
        <p className="mt-3 text-xs text-muted">Résultats récents indisponibles.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {bouts.map((bout: FighterRecentBout, i) => {
            const meta = RESULT_META[bout.result]
            return (
              <li key={`${bout.opponentName}-${i}`} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                    meta.className,
                  )}
                  title={meta.label}
                  aria-label={meta.label}
                >
                  {meta.short}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground/90">
                  {bout.opponentName}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted">
                  {whenLabel(bout.monthsAgo)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function RecentResults({ red, blue }: RecentResultsProps) {
  const hasData = recentBouts(red).length > 0 || recentBouts(blue).length > 0
  if (!hasData) return null

  return (
    <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Forme récente</p>
      <h2 className="mt-1 font-display text-base font-semibold tracking-tight">
        5 derniers résultats
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <FighterColumn fighter={red} />
        <FighterColumn fighter={blue} />
      </div>
    </section>
  )
}
