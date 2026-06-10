'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import type { Event } from '@/types'
import { getFreePreviewFight } from '@/lib/event-helpers'

type FightPremiumTeaserProps = {
  event: Event
  fightId: string
}

export function FightPremiumTeaser({ event, fightId }: FightPremiumTeaserProps) {
  const { isPremium, loading } = useSubscription()
  const freeFight = getFreePreviewFight(event)

  if (loading || isPremium || freeFight?.id !== fightId) return null

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
            Vous avez aimé cette analyse ?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8a8278]">
            Topuria vs Gaethje, O&apos;Malley vs Zahabi{othersLabel}
            <br />
            sont disponibles en Premium.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/ufc-pronostics"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#f5f2eb] transition-colors hover:border-[#c9b896]/40 hover:text-[#c9b896]"
            >
              Voir tous les combats →
            </Link>
            <Link
              href="/pricing"
              className="rounded-full bg-[#f5f2eb] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-transform hover:scale-[1.02]"
            >
              Passer Premium — 9,99€/mois
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
