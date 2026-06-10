'use client'

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

export function OrgEventFightCardList({ event, excludeFightId }: OrgEventFightCardListProps) {
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
          {cardFights.map((fight) => (
            <FightCardRow
              key={fight.id}
              fight={fight}
              event={event}
              isPremium={effectivePremium}
              accessReady={!subLoading}
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
  const rowClass =
    'group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-6'

  return (
    <li>
      <FastLink href={href} className={rowClass}>
        <FightRowContent fight={fight} unlocked={hasAccess} />
        <span
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium shrink-0',
            hasAccess ? 'text-[#c9b896]' : 'text-[#8a8278] group-hover:text-[#c9b896]',
          )}
        >
          {hasAccess ? (
            <>
              Voir le pronostic
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
              Débloquer cette analyse
              <ChevronRight className="h-4 w-4 opacity-60" />
            </>
          )}
        </span>
      </FastLink>
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
      ) : (
        <div className="mt-3">
          <PredictionKeyFactors
            fight={fight}
            compact
            hideFooter
            className="!mx-0 !max-w-none !bg-transparent !px-0 !py-0 !border-0"
          />
        </div>
      )}
    </div>
  )
}
