'use client'

import Link from 'next/link'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
import { EventPredictionsBadge } from '@/components/pronostics/EventPredictionsBadge'
import { useEvents } from '@/hooks/useEvents'
import { useSubscription } from '@/hooks/useSubscription'
import { getOrganization } from '@/data/organizations'
import { formatShortDate } from '@/utils/format'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import { Calendar, Users } from 'lucide-react'

export function UpcomingEvents() {
  const { events } = useEvents()
  const { isPremium } = useSubscription()
  const upcoming = [...events]
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <section id="events" className="section-padding bg-card/20">
      <div className="container-content">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Calendrier</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Prochains événements
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Cartes à venir visibles tout de suite ; les pronostics complets sont publiés au fil des
            semaines.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {upcoming.map((event, i) => {
            const org = getOrganization(event.organizationId)
            const main = getMainFight(event)
            const freePreview = getFreePreviewFight(event)
            const published = isEventPredictionsPublished(event)
            const linkFight = published ? (isPremium ? main : freePreview ?? main) : null
            const orgHref = org?.seoPathFr ?? '/'
            const href = published
              ? linkFight
                ? `/fight/${linkFight.id}`
                : orgHref
              : `${orgHref}#event-${event.id}`

            return (
              <FadeIn key={event.id} delay={i * 0.08}>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                  <Link
                    href={href}
                    className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {org ? (
                        <OrgBrandLogo orgId={org.id} size="md" glow="soft" />
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                          —
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Calendar size={12} />
                        {formatShortDate(event.date)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <EventPredictionsBadge event={event} />
                    </div>
                    <h3 className="mt-3 font-medium text-lg">{event.name}</h3>
                    {linkFight ? (
                      <p className="mt-2 text-sm text-muted">
                        {isPremium ? 'Main' : 'Co-main (gratuit)'} : {linkFight.redCorner.name} vs{' '}
                        {linkFight.blueCorner.name}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-amber-200/80">
                        Carte annoncée — pronostics en cours de préparation
                      </p>
                    )}
                    {published &&
                      event.communityPredictions != null &&
                      event.communityPredictions > 0 && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                          <Users size={12} />
                          {event.communityPredictions.toLocaleString('fr-FR')} pronostics
                          communauté
                        </p>
                      )}
                  </Link>
                </motion.div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn className="mt-8 text-center">
          <Link
            href="/ufc-pronostics"
            className="text-sm text-gold hover:underline underline-offset-4"
          >
            Tous les pronostics UFC →
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
