import Link from 'next/link'
import type { Organization } from '@/types'
import type { Event } from '@/types'
import { getMainFight, getFreePreviewFight } from '@/lib/event-helpers'
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
        <ul className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c1219]/40">
          {events.map((event) => {
            const linkFight = getFreePreviewFight(event) ?? getMainFight(event)
            const isActive = event.id === activeEventId
            return (
              <li key={event.id}>
                <Link
                  href={
                    isActive
                      ? `${org.seoPathFr}#pronostic`
                      : linkFight
                        ? `/fight/${linkFight.id}`
                        : org.seoPathFr
                  }
                  className={cn(
                    'flex flex-col gap-2 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
                    isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
                  )}
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    {linkFight && (
                      <p className="mt-0.5 text-sm text-muted">
                        {linkFight.redCorner.name} vs {linkFight.blueCorner.name}
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
