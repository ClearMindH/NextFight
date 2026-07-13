'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { ChevronRight } from 'lucide-react'
import type { Event, Fight, Organization } from '@/types'
import { sortFightsByCardOrder, getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import {
  canAccessFightPrediction,
  getFightDetailHref,
} from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { LockedFightTeaser } from '@/components/pronostics/LockedFightTeaser'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'

interface OrgEventFightCardListProps {
  org: Organization
  event: Event
  /** Combat déjà affiché en haut (page /fight/[id]) */
  excludeFightId?: string
}

function featuredFightForUser(event: Event, isPremium: boolean): Fight | undefined {
  const mainFight = getMainFight(event)
  const freeFight = getFreePreviewFight(event)
  return isPremium ? (mainFight ?? freeFight) : (freeFight ?? mainFight)
}

function fightRoleLabel(fight: Fight): string {
  if (fight.isMainEvent) return 'Main event'
  if (fight.order === 2) return 'Co-main'
  if (fight.isTitle) return 'Titre'
  return `Combat ${fight.order}`
}

export function OrgEventFightCardList({ org, event, excludeFightId }: OrgEventFightCardListProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const featured = featuredFightForUser(event, isPremium)
  const accessReady = !subLoading || isPremium
  const hiddenIds = new Set(
    [featured?.id, excludeFightId].filter((id): id is string => Boolean(id)),
  )
  const cardFights = sortFightsByCardOrder(event).filter((f) => !hiddenIds.has(f.id))
  const onFightPage = Boolean(excludeFightId)

  if (cardFights.length === 0) return null

  return (
    <section className="border-b border-white/[0.06] bg-[#050505]">
      <div className="container-content section-padding">
        <div className="max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8278]">
            {onFightPage ? 'Suite de la carte' : isPremium ? 'Carte complète' : 'Toute la carte'}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {onFightPage
              ? `${cardFights.length} autre${cardFights.length > 1 ? 's' : ''} combat${cardFights.length > 1 ? 's' : ''} sur cette carte`
              : isPremium
                ? `${event.fights.length} combats · pronostics Premium`
                : `${cardFights.length} combat${cardFights.length > 1 ? 's' : ''} sur la carte`}
          </h2>
          {!isPremium && accessReady && (
            <p className="mt-2 text-sm text-[#8a8278] leading-relaxed">
              {onFightPage
                ? 'Picks visibles ci-dessous — abonnez-vous pour les analyses complètes.'
                : 'Co-main gratuit en analyse complète. Picks visibles sur les autres combats.'}
            </p>
          )}
        </div>

        {!isPremium && accessReady && onFightPage && cardFights.length > 0 && (
          <div className="mx-auto mt-6 max-w-4xl">
            <StripeCheckoutButton planId="premium_monthly" highlighted className="max-w-sm">
              Débloquer les {cardFights.length} combats · {PREMIUM_MONTHLY_PRICE_LABEL}/mois
            </StripeCheckoutButton>
          </div>
        )}

        <ul className="mx-auto mt-6 max-w-4xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {cardFights.map((fight) => (
            <FightCardRow
              key={fight.id}
              fight={fight}
              event={event}
              isPremium={isPremium}
              accessReady={accessReady}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

function FightCardRow({
  fight,
  event,
  isPremium,
  accessReady,
}: {
  fight: Fight
  event: Event
  isPremium: boolean
  accessReady: boolean
}) {
  const hasAccess = accessReady && canAccessFightPrediction(fight, event, isPremium)
  const href = getFightDetailHref(fight, event, isPremium)

  return (
    <li className="px-5 py-4 transition-colors hover:bg-white/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <FightRowContent fight={fight} unlocked={hasAccess} />
        {hasAccess ? (
          <FastLink
            href={href}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[#c9b896]"
          >
            Voir l&apos;analyse
            <ChevronRight className="h-4 w-4" />
          </FastLink>
        ) : (
          <StripeCheckoutButton planId="premium_monthly" className="max-w-[240px] shrink-0 self-start">
            Analyse complète
          </StripeCheckoutButton>
        )}
      </div>
    </li>
  )
}

function FightRowContent({ fight, unlocked }: { fight: Fight; unlocked: boolean }) {
  if (!unlocked) {
    return (
      <div className="min-w-0 flex-1">
        <LockedFightTeaser fight={fight} className="border-none bg-transparent px-0 py-0" />
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a8278]">
          {fightRoleLabel(fight)}
        </span>
        <span className="text-[10px] text-[#5c5c5c]">·</span>
        <span className="text-xs text-[#6b6b6b]">{fight.weightClass}</span>
      </div>
      <div className="mt-3">
        <FighterMatchupLine red={fight.redCorner} blue={fight.blueCorner} />
      </div>
      <div className="mt-2">
        <PredictionVerdictBanner fight={fight} variant="compact" />
      </div>
    </div>
  )
}
