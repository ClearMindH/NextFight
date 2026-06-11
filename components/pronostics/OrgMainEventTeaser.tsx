'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { Lock } from 'lucide-react'
import type { Event, Organization } from '@/types'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionKeyFactors } from '@/components/pronostics/PredictionKeyFactors'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { cn } from '@/utils/cn'

type OrgMainEventTeaserProps = {
  org: Organization
  event: Event
}

export function OrgMainEventTeaser({ org: _org, event }: OrgMainEventTeaserProps) {
  const { isPremium } = useSubscription()
  const mainFight = getMainFight(event)
  const freeFight = getFreePreviewFight(event)

  if (isPremium || !mainFight) return null
  if (freeFight?.id === mainFight.id) return null

  return (
    <section className="border-b border-white/[0.06] bg-[#080808]">
      <div className="container-content px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#c9b896]/20 bg-gradient-to-b from-[#12100e] to-[#080808] p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9b896]/30 bg-[#c9b896]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c9b896]">
              <Lock className="h-3 w-3" aria-hidden />
              Main event · Premium
            </span>
            <span className="text-xs text-[#6b6560]">{mainFight.weightClass}</span>
          </div>

          <div className="mt-4">
            <FighterMatchupLine red={mainFight.redCorner} blue={mainFight.blueCorner} variant="elegant" />
          </div>

          <PredictionKeyFactors
            fight={mainFight}
            compact
            hideFooter
            locked
            className="mt-4 !mx-0 !max-w-none !border-white/[0.06]"
          />

          <p className="mt-4 text-sm leading-relaxed text-[#8a8278]">
            Probabilités, forme récente, comparaison striking/grappling et justification complète du
            modèle — réservé aux abonnés Premium.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StripeCheckoutButton planId="premium_monthly" highlighted className="sm:max-w-xs">
              Débloquer le main event
            </StripeCheckoutButton>
            <FastLink
              href="/pricing"
              className="text-center text-sm text-[#8a8278] transition-colors hover:text-[#c9b896] sm:text-left"
            >
              Voir les offres →
            </FastLink>
          </div>
        </div>
      </div>
    </section>
  )
}
