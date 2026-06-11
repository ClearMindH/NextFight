'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import type { Event } from '@/types'
import { getFreePreviewFight } from '@/lib/event-helpers'

type FightPremiumTeaserProps = {
  event: Event
  fightId: string
}

export function FightPremiumTeaser({ event, fightId }: FightPremiumTeaserProps) {
  const { isPremium } = useSubscription()
  const freeFight = getFreePreviewFight(event)

  if (isPremium || freeFight?.id !== fightId) return null

  const lockedCount = Math.max(event.fights.length - 1, 0)
  const othersCount = Math.max(lockedCount - 2, 0)
  const othersLabel =
    othersCount > 0
      ? ` et ${othersCount} autre${othersCount > 1 ? 's' : ''} combat${othersCount > 1 ? 's' : ''}`
      : ''

  return (
    <section className="border-t border-white/[0.08] bg-[#0c0c10]">
      <div className="container-content section-padding">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#c9b896]/25 bg-[#12100c] px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[#f5f2eb]">
            Débloquez toute la carte
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8a8278]">
            Comparaisons détaillées, facteurs décisifs et score complet du modèle pour Topuria vs
            Gaethje, O&apos;Malley vs Zahabi{othersLabel}.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:items-center">
            <StripeCheckoutButton planId="premium_monthly" highlighted className="sm:max-w-xs">
              Débloquer cette analyse
            </StripeCheckoutButton>
            <Link
              href="/ufc-pronostics"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#f5f2eb] transition-colors hover:border-[#c9b896]/40 hover:text-[#c9b896]"
            >
              Voir tous les combats →
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-[#5c5c5c]">Premium · 9,99€/mois · annulable</p>
        </div>
      </div>
    </section>
  )
}
