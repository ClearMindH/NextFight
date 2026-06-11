'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { FastLink } from '@/components/navigation/FastLink'
import { Lock, ChevronRight } from 'lucide-react'
import type { Event, Fight, Organization } from '@/types'
import { sortFightsByCardOrder, getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import {
  canAccessFightPrediction,
  getFightDetailHref,
} from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { PredictionKeyFactors } from '@/components/pronostics/PredictionKeyFactors'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { UfcInlinePricingBlock } from '@/components/conversion/UfcInlinePricingBlock'
import { cn } from '@/utils/cn'

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
  const effectivePremium = !subLoading && isPremium
  const featured = featuredFightForUser(event, effectivePremium)
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
              : effectivePremium
                ? `${event.fights.length} combats · pronostics Premium`
                : `${cardFights.length} combat${cardFights.length > 1 ? 's' : ''} sur la carte`}
          </h2>
          {!effectivePremium && !subLoading && (
            <p className="mt-2 text-sm text-[#8a8278] leading-relaxed">
              {onFightPage
                ? 'Explorez les autres combats — abonnez-vous Premium pour ouvrir chaque pronostic.'
                : 'Le co-main gratuit est affiché ci-dessus. Les autres combats ouvrent la page Tarifs.'}
            </p>
          )}
        </div>

        <ul className="mx-auto mt-6 max-w-4xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {cardFights.map((fight, index) => (
            <Fragment key={fight.id}>
              <FightCardRow
                fight={fight}
                event={event}
                isPremium={effectivePremium}
                accessReady={!subLoading}
                showInlinePricingTeaser={!effectivePremium && !onFightPage}
              />
              {org.id === 'ufc' && !effectivePremium && !onFightPage && index === 1 ? (
                <UfcInlinePricingBlock />
              ) : null}
            </Fragment>
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
  showInlinePricingTeaser,
}: {
  fight: Fight
  event: Event
  isPremium: boolean
  accessReady: boolean
  showInlinePricingTeaser: boolean
}) {
  const hasAccess = accessReady && canAccessFightPrediction(fight, event, isPremium)
  const href = getFightDetailHref(fight, event, isPremium)

  return (
    <li className="px-5 py-4 transition-colors hover:bg-white/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <FightRowContent fight={fight} unlocked={hasAccess} />
        <FastLink
          href={href}
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium shrink-0 self-start',
            hasAccess ? 'text-[#c9b896]' : 'text-[#8a8278] hover:text-[#c9b896]',
          )}
        >
          {hasAccess ? (
            <>
              Voir le pronostic
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
              Aperçu verrouillé
              <ChevronRight className="h-4 w-4 opacity-60" />
            </>
          )}
        </FastLink>
      </div>

      {!hasAccess && showInlinePricingTeaser && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <PredictionKeyFactors
            fight={fight}
            compact
            hideFooter
            visibleFactorCount={1}
            className="!mx-0 !max-w-none !rounded-lg !border-white/[0.06] !bg-[#0a0f14]/80 !px-3 !py-3"
          />
          <Link
            href="/pricing"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#c9b896] transition-colors hover:text-[#e8dcc4]"
          >
            Voir l&apos;analyse complète → 9,99€/mois
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </li>
  )
}

function FightRowContent({ fight, unlocked }: { fight: Fight; unlocked: boolean }) {
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
      {unlocked ? (
        <div className="mt-2">
          <PredictionVerdictBanner fight={fight} variant="compact" />
        </div>
      ) : null}
    </div>
  )
}
