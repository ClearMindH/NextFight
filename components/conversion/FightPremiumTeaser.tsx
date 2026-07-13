'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import type { Event } from '@/types'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { buildPredictionVerdict } from '@/lib/prediction-verdict'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'

type FightPremiumTeaserProps = {
  event: Event
  fightId: string
}

export function FightPremiumTeaser({ event, fightId }: FightPremiumTeaserProps) {
  const { isPremium } = useSubscription()
  const freeFight = getFreePreviewFight(event)

  if (isPremium || freeFight?.id !== fightId) return null

  const lockedCount = Math.max(event.fights.length - 1, 0)
  const mainFight = getMainFight(event)
  const mainVerdict = mainFight ? buildPredictionVerdict(mainFight) : null

  return (
    <section className="border-y border-[#e8c840]/20 bg-gradient-to-b from-[#12100a] to-[#0a0a0a]">
      <div className="container-content section-padding">
        <div className="mx-auto max-w-3xl rounded-2xl border-2 border-[#e8c840]/30 bg-[#0f0e0a] px-6 py-10 text-center shadow-[0_0_60px_-12px_rgba(232,200,64,0.15)] sm:px-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8c840]/15">
            <Lock className="h-6 w-6 text-[#e8c840]" aria-hidden />
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8c840]">
            Vous avez vu le pronostic gratuit
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#f5f2eb] sm:text-3xl">
            Débloquez les {lockedCount} autres combats
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#a8a29e] sm:text-base">
            {mainVerdict ? (
              <>
                Main event : <span className="font-medium text-white">{mainVerdict.headline}</span>
                {mainVerdict.probabilityLine ? (
                  <span className="text-[#e8c840]"> · {mainVerdict.probabilityLine}</span>
                ) : null}
                {' — '}débloquez l&apos;analyse complète des {lockedCount} autres combats.
              </>
            ) : (
              <>
                Picks visibles sur toute la carte — analyses détaillées pour les{' '}
                {lockedCount} autres combats.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:items-center">
            <StripeCheckoutButton planId="premium_monthly" highlighted className="w-full sm:max-w-xs">
              S&apos;abonner · {PREMIUM_MONTHLY_PRICE_LABEL}/mois
            </StripeCheckoutButton>
            <Link
              href="/pricing"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#f5f2eb] transition-colors hover:border-[#e8c840]/40 hover:text-[#e8c840]"
            >
              Comparer les offres →
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-[#5c5c5c]">
            Paiement sécurisé · annulation libre · accès immédiat
          </p>
        </div>
      </div>
    </section>
  )
}
