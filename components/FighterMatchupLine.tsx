import type { Fighter } from '@/types'
import { getCountryFlagEmoji } from '@/lib/country-flag'
import { formatFighterNickname } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FighterMatchupLineProps {
  red: Fighter
  blue: Fighter
  /** Affiche record et surnom (fiche combat). */
  detailed?: boolean
  /** Sans drapeaux — indicateur coin rouge/bleu uniquement. */
  variant?: 'default' | 'elegant'
  className?: string
}

function FighterSide({
  fighter,
  align,
  detailed,
  variant,
}: {
  fighter: Fighter
  align: 'left' | 'right'
  detailed?: boolean
  variant: 'default' | 'elegant'
}) {
  const nickname = formatFighterNickname(fighter.nickname)
  const flag = getCountryFlagEmoji(fighter.country)
  const isRed = align === 'left'

  if (variant === 'elegant') {
    return (
      <span
        className={cn(
          'inline-flex min-w-0 flex-1 items-center gap-2.5',
          align === 'right' && 'flex-row-reverse text-right',
        )}
      >
        <span
          className={cn(
            'h-8 w-1 shrink-0 rounded-full',
            isRed ? 'bg-red-500/80' : 'bg-blue-500/80',
          )}
          aria-hidden
        />
        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {fighter.name}
          </span>
          {detailed && nickname && (
            <span className="block text-xs italic text-gold/80">&ldquo;{nickname}&rdquo;</span>
          )}
          {detailed && (
            <span className="block text-xs tabular-nums text-muted">{fighter.record}</span>
          )}
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex min-w-0 flex-1 items-center gap-2',
        align === 'right' && 'flex-row-reverse text-right',
      )}
    >
      <span className="shrink-0 text-xl leading-none sm:text-2xl" aria-hidden>
        {flag}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{fighter.name}</span>
        {detailed && nickname && (
          <span className="block text-xs italic text-gold/90">&ldquo;{nickname}&rdquo;</span>
        )}
        {detailed && (
          <span className="block text-xs tabular-nums text-muted">{fighter.record}</span>
        )}
      </span>
    </span>
  )
}

/** Ligne type bookmaker : drapeau · nom · vs · nom · drapeau */
export function FighterMatchupLine({
  red,
  blue,
  detailed,
  variant = 'default',
  className,
}: FighterMatchupLineProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 sm:gap-4',
        detailed ? 'flex-col sm:flex-row' : 'flex-row',
        variant === 'elegant' && 'gap-2 sm:gap-3',
        className,
      )}
    >
      <FighterSide fighter={red} align="left" detailed={detailed} variant={variant} />
      <span
        className={cn(
          'shrink-0 font-display text-[10px] font-medium uppercase tracking-[0.2em]',
          variant === 'elegant' ? 'text-muted/70' : 'text-xs text-muted',
        )}
      >
        vs
      </span>
      <FighterSide fighter={blue} align="right" detailed={detailed} variant={variant} />
    </div>
  )
}
