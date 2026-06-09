import { FastLink } from '@/components/navigation/FastLink'
import type { Organization } from '@/types'
import type { Event } from '@/types'
import { getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
import { EventPredictionsBadge } from '@/components/pronostics/EventPredictionsBadge'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { getOrgEventFlag } from '@/lib/org-flag'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface OrgEventCalendarProps {
  org: Organization
  events: Event[]
  activeEventId?: string
}

export function OrgEventCalendar({ org, events, activeEventId }: OrgEventCalendarProps) {
  if (events.length <= 1) return null

  const { emoji, regionLabel } = getOrgEventFlag(org.id)

  return (
    <section className="border-b border-white/[0.06] bg-[#060a10]/40">
      <div className="container-content section-padding">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Calendrier {org.name}
        </h2>
        <p className="mt-2 text-sm text-[#8a8278]">
          Les événements à venir sont listés ici ; les pronostics détaillés arrivent semaine par
          semaine.
        </p>
        <ul className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {events.map((event) => {
            const linkFight = getFreePreviewFight(event) ?? getMainFight(event)
            const isActive = event.id === activeEventId
            const published = isEventPredictionsPublished(event)
            const href = published
              ? isActive
                ? `${org.seoPathFr}#pronostic`
                : linkFight
                  ? `/fight/${linkFight.id}`
                  : org.seoPathFr
              : `${org.seoPathFr}#event-${event.id}`

            return (
              <li key={event.id}>
                <FastLink
                  href={href}
                  className={cn(
                    'flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-6',
                    isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-lg leading-none" title={regionLabel} aria-hidden>
                        {emoji}
                      </span>
                      <p className="font-medium">{event.name}</p>
                      <EventPredictionsBadge event={event} />
                    </div>
                    {linkFight && (
                      <div className="mt-3">
                        <FighterMatchupLine red={linkFight.redCorner} blue={linkFight.blueCorner} />
                        {!published && (
                          <p className="mt-1.5 text-xs text-[#5c5c5c]">Analyse à venir</p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    {formatShortDate(event.date)}
                  </span>
                </FastLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
