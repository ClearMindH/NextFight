import { Lock } from 'lucide-react'
import type { Fight } from '@/types'
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
  /** Affiche la catégorie de poids (sans noms de combattants). */
  showWeightClass?: boolean
}

/** Aperçu verrouillé — aucun nom, pronostic ni probabilité. */
export function LockedFightTeaser({
  fight,
  className,
  showWeightClass = true,
}: LockedFightTeaserProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-dashed border-[#e8c840]/20 bg-[#0a0a0a]/80 px-4 py-3.5',
        className,
      )}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8c840]/10"
        aria-hidden
      >
        <Lock className="h-4 w-4 text-[#e8c840]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8c840]">
          {fightRoleLabel(fight)}
          {showWeightClass && (
            <>
              <span className="mx-1.5 font-normal text-[#5c5c5c]">·</span>
              <span className="font-medium text-[#8a8278]">{fight.weightClass}</span>
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-[#8a8278]">
          Pronostic, probabilités et analyse réservés Premium
        </p>
      </div>
    </div>
  )
}
