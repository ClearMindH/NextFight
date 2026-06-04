'use client'

import Link from 'next/link'
import { Lock, ChevronRight } from 'lucide-react'
import type { Event, Fight, Organization } from '@/types'
import { sortFightsByCardOrder, getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import { canAccessFightPrediction } from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'

interface OrgEventFightCardListProps {
  org: Organization
  event: Event
}

function featuredFightForUser(
  event: Event,
  isPremium: boolean,
): Fight | undefined {
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

export function OrgEventFightCardList({ org, event }: OrgEventFightCardListProps) {
  const { isPremium, loading } = useSubscription()
  const featured = featuredFightForUser(event, isPremium)
  const cardFights = sortFightsByCardOrder(event).filter((f) => f.id !== featured?.id)

  if (loading || cardFights.length === 0) return null

  return (
    <section className="border-b border-white/[0.06] bg-[#050505]">
      <div className="container-content section-padding">
        <div className="max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8278]">
            {isPremium ? 'Carte complète' : 'Reste de la carte'}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {isPremium
              ? `${event.fights.length} combats · pronostics Premium`
              : `${cardFights.length} autre${cardFights.length > 1 ? 's' : ''} combat${cardFights.length > 1 ? 's' : ''}`}
          </h2>
          {!isPremium && !loading && (
            <p className="mt-2 text-sm text-[#8a8278] leading-relaxed">
              Le co-main est gratuit ci-dessus. Premium débloque le main event et toute la carte.
            </p>
          )}
        </div>

        <ul className="mx-auto mt-8 max-w-4xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {cardFights.map((fight) => {
            const hasAccess = canAccessFightPrediction(fight, event, isPremium)
            const redProb = fight.model.redWinProbability
            const favorite =
              redProb >= 50 ? fight.redCorner.name.split(' ').pop() : fight.blueCorner.name.split(' ').pop()

            return (
              <li key={fight.id}>
                {hasAccess ? (
                  <Link
                    href={`/fight/${fight.id}`}
                    className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <FightRowContent
                      fight={fight}
                      favorite={favorite}
                      redProb={redProb}
                      unlocked
                    />
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#c9b896] shrink-0">
                      Voir le pronostic
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <FightRowContent
                      fight={fight}
                      favorite={favorite}
                      redProb={redProb}
                      unlocked={false}
                    />
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 text-sm text-[#8a8278] hover:text-[#c9b896] shrink-0"
                    >
                      <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Premium
                    </Link>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {isPremium && (
          <p className="mx-auto mt-6 max-w-4xl text-center text-xs text-[#6b6b6b]">
            Cliquez sur un combat pour l’analyse complète, stats et forme récente.
          </p>
        )}
      </div>
    </section>
  )
}

function FightRowContent({
  fight,
  favorite,
  redProb,
  unlocked,
}: {
  fight: Fight
  favorite: string | undefined
  redProb: number
  unlocked: boolean
}) {
  return (
    <div className={cn('min-w-0 flex-1', !unlocked && 'opacity-75')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a8278]">
          {fightRoleLabel(fight)}
        </span>
        <span className="text-[10px] text-[#5c5c5c]">·</span>
        <span className="text-xs text-[#6b6b6b]">{fight.weightClass}</span>
      </div>
      <p className="mt-1.5 font-medium text-[#f5f2eb]">
        {fight.redCorner.name}{' '}
        <span className="font-normal text-[#6b6b6b]">vs</span> {fight.blueCorner.name}
      </p>
      {unlocked && favorite && (
        <p className="mt-1 text-xs tabular-nums text-[#8a8278]">
          Favori modèle : {favorite} · {formatPercent(Math.max(redProb, 100 - redProb))}
        </p>
      )}
    </div>
  )
}
