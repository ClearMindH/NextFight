import Link from 'next/link'
import type { Organization } from '@/types'
import type { Event } from '@/types'
import { getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
import { EventPredictionsBadge } from '@/components/pronostics/EventPredictionsBadge'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface OrgEventCalendarProps {
  org: Organization
  events: Event[]
  activeEventId?: string
}

export function OrgEventCalendar({ org, events, activeEventId }: OrgEventCalendarProps) {
  if (events.length <= 1) return null

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
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col gap-2 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
                    isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.name}</p>
                      <EventPredictionsBadge event={event} />
                    </div>
                    {linkFight && (
                      <p className="mt-0.5 text-sm text-muted">
                        {linkFight.redCorner.name} vs {linkFight.blueCorner.name}
                        {!published && (
                          <span className="text-[#5c5c5c]"> · analyse à venir</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    {formatShortDate(event.date)}
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
