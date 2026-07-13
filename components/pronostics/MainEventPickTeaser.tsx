'use client'

import type { Event } from '@/types'
import { getMainFight } from '@/lib/event-helpers'
import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'
import { useSubscription } from '@/hooks/useSubscription'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { cn } from '@/utils/cn'

type MainEventPickTeaserProps = {
  event: Event
  className?: string
}

/** CTA conversion : pick du main event visible, analyse complète Premium. */
export function MainEventPickTeaser({ event, className }: MainEventPickTeaserProps) {
  const { isPremium, loading } = useSubscription()
  const mainFight = getMainFight(event)

  if (loading || isPremium || !mainFight) return null

  const verdict = buildPredictionVerdict(mainFight)
  const redProb = mainFight.model.redWinProbability
  const blueProb = 100 - redProb

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-[#e8c840]/40 bg-gradient-to-br from-[#1a1608] to-[#0a0a0a] p-4 sm:p-5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8c840]">
        Main event · pick visible
      </p>
      <h4 className="mt-2 font-display text-lg font-semibold text-white sm:text-xl">
        {fighterShortName(mainFight.redCorner.name)}
        <span className="mx-2 font-normal text-[#6f6a62]">vs</span>
        {fighterShortName(mainFight.blueCorner.name)}
      </h4>

      <div className="mt-3">
        <FighterMatchupLine
          red={mainFight.redCorner}
          blue={mainFight.blueCorner}
          variant="elegant"
        />
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="bg-red-500/90" style={{ width: `${redProb}%` }} />
        <div className="bg-blue-500/80" style={{ width: `${blueProb}%` }} />
      </div>

      <div className="mt-3 rounded-lg border border-[#e8c840]/20 bg-black/40 px-4 py-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8278]">
          Notre pronostic
        </p>
        <p className="mt-1 text-base font-semibold text-white">{verdict.headline}</p>
        {verdict.probabilityLine && (
          <p className="mt-1 text-sm font-semibold tabular-nums text-[#e8c840]">
            {verdict.probabilityLine}
          </p>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#a8a29e]">
        Débloquez l&apos;analyse complète du main event et des {event.fights.length - 2} autres
        combats — facteurs, méthode et justification du modèle.
      </p>

      <div className="mt-4">
        <StripeCheckoutButton planId="premium_monthly" highlighted className="w-full sm:max-w-xs">
          Débloquer · {PREMIUM_MONTHLY_PRICE_LABEL}/mois
        </StripeCheckoutButton>
      </div>
    </div>
  )
}
