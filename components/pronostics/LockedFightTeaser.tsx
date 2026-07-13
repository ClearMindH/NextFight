import { Lock } from 'lucide-react'
import type { Fight } from '@/types'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { cn } from '@/utils/cn'

function fightRoleLabel(fight: Fight): string {
  if (fight.isMainEvent) return 'Main event'
  if (fight.order === 2) return 'Co-main'
  if (fight.isTitle) return 'Titre'
  return `Combat ${fight.order}`
}

type LockedFightTeaserProps = {
  fight: Fight
  className?: string
  showWeightClass?: boolean
  /** Met en avant le pick (main event, liste carte). */
  highlight?: boolean
}

/** Pick visible (nom + %), analyse complète verrouillée. */
export function LockedFightTeaser({
  fight,
  className,
  showWeightClass = true,
  highlight = false,
}: LockedFightTeaserProps) {
  return (
    <div
      className={cn(
        'min-w-0',
        highlight
          ? 'rounded-xl border border-[#e8c840]/25 bg-[#12100a]/80 px-4 py-4'
          : undefined,
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8c840]">
          {fightRoleLabel(fight)}
        </span>
        {showWeightClass && (
          <>
            <span className="text-[10px] text-[#5c5c5c]">·</span>
            <span className="text-xs text-[#8a8278]">{fight.weightClass}</span>
          </>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8c840]/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#c9b896]">
          <Lock className="h-2.5 w-2.5" aria-hidden />
          Analyse Premium
        </span>
      </div>

      <div className="mt-3">
        <FighterMatchupLine red={fight.redCorner} blue={fight.blueCorner} variant="elegant" />
      </div>

      <div className="mt-3">
        <PredictionVerdictBanner fight={fight} variant="inline" />
      </div>

      <p className="mt-2 text-xs text-[#6f6a62]">
        Facteurs clés, méthode et lecture matchup — avec Premium
      </p>
    </div>
  )
}
