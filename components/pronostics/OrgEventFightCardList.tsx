'use client'

import Link from 'next/link'
import { Lock, ChevronRight } from 'lucide-react'
import type { Event, Fight, Organization } from '@/types'
import { sortFightsByCardOrder, getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import { canAccessFightPrediction } from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { FightCardMiniPortrait } from '@/components/fight/FightCardMiniPortrait'
import { cn } from '@/utils/cn'

interface OrgEventFightCardListProps {
  org: Organization
  event: Event
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
            {isPremium ? 'Carte complète' : 'Toute la carte'}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {isPremium
              ? `${event.fights.length} combats · pronostics Premium`
              : `${cardFights.length} combat${cardFights.length > 1 ? 's' : ''} sur la carte`}
          </h2>
          {!isPremium && !loading && (
            <p className="mt-2 text-sm text-[#8a8278] leading-relaxed">
              Le co-main gratuit est affiché ci-dessus. Cliquez sur un combat pour l’ouvrir — le
              pronostic complet est réservé aux abonnés Premium.
            </p>
          )}
        </div>

        <ul className="mx-auto mt-8 max-w-4xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {cardFights.map((fight) => {
            const hasAccess = canAccessFightPrediction(fight, event, isPremium)

            return (
              <li key={fight.id}>
                <Link
                  href={`/fight/${fight.id}`}
                  className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
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
                        Premium
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
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
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center -space-x-2">
          <FightCardMiniPortrait fighter={fight.redCorner} corner="red" />
          <FightCardMiniPortrait fighter={fight.blueCorner} corner="blue" />
        </div>
        <p className="font-medium text-[#f5f2eb]">
          {fight.redCorner.name}{' '}
          <span className="font-normal text-[#6b6b6b]">vs</span> {fight.blueCorner.name}
        </p>
      </div>
      {unlocked ? (
        <div className="mt-2">
          <PredictionVerdictBanner fight={fight} variant="compact" />
        </div>
      ) : (
        <p className="mt-2 text-xs text-[#8a8278]">Pronostic détaillé · Premium</p>
      )}
    </div>
  )
}
