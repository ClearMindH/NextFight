'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
import { EventPredictionsBadge } from '@/components/pronostics/EventPredictionsBadge'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { useEvents } from '@/hooks/useEvents'
import { useSubscription } from '@/hooks/useSubscription'
import { getOrganization } from '@/data/organizations'
import { getOrgBrand } from '@/lib/org-brand'
import { formatShortDate } from '@/utils/format'
import { FadeIn } from '@/components/motion/FadeIn'
import { ChevronRight, Users } from 'lucide-react'
import { cn } from '@/utils/cn'

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

        <FadeIn delay={0.05}>
          <ul className="mt-10 space-y-3">
            {upcoming.map((event) => {
              const org = getOrganization(event.organizationId)
              const brand = org ? getOrgBrand(org.id) : null
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
                <li key={event.id}>
                  <FastLink
                    href={href}
                    className={cn(
                      'group relative block overflow-hidden rounded-2xl border border-white/[0.07]',
                      'bg-gradient-to-br from-card via-card to-black/40',
                      'transition-all duration-300 hover:border-gold/20 hover:shadow-[0_8px_32px_-12px_rgba(201,162,39,0.15)]',
                    )}
                  >
                    {brand && (
                      <div
                        className="absolute inset-y-0 left-0 w-1 opacity-80 transition-opacity group-hover:opacity-100"
                        style={{ background: `linear-gradient(to bottom, ${brand.accent}, transparent)` }}
                      />
                    )}

                    <div className="px-5 py-5 sm:px-6 sm:py-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 pl-2 sm:pl-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {org && (
                              <span
                                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/90"
                              >
                                {org.name}
                              </span>
                            )}
                            <EventPredictionsBadge event={event} />
                          </div>

                          <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                            {event.name}
                          </h3>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 pl-2 sm:flex-col sm:items-end sm:pl-0">
                          <time className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-1.5 text-xs font-medium tabular-nums text-muted">
                            {formatShortDate(event.date)}
                          </time>
                          <ChevronRight className="hidden h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold sm:block" />
                        </div>
                      </div>

                      {linkFight ? (
                        <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/25 px-4 py-4 backdrop-blur-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                            {isPremium ? 'Main event' : 'Co-main gratuit'}
                          </p>
                          <div className="mt-3">
                            <FighterMatchupLine
                              red={linkFight.redCorner}
                              blue={linkFight.blueCorner}
                              variant="elegant"
                            />
                          </div>
                          <div className="mt-4 border-t border-white/[0.06] pt-4">
                            <PredictionVerdictBanner
                              fight={linkFight}
                              variant="inline"
                              showProbability
                            />
                          </div>
                        </div>
                      ) : published ? (
                        <p className="mt-4 pl-2 text-sm text-[#c9b896]/90 sm:pl-3">
                          Pronostics disponibles — ouvrir la carte complète
                        </p>
                      ) : (
                        <p className="mt-4 pl-2 text-sm text-amber-200/75 sm:pl-3">
                          Carte annoncée — pronostics en cours de préparation
                        </p>
                      )}

                      {published &&
                        event.communityPredictions != null &&
                        event.communityPredictions > 0 && (
                          <p className="mt-4 flex items-center gap-1.5 pl-2 text-xs text-muted sm:pl-3">
                            <Users size={12} />
                            {event.communityPredictions.toLocaleString('fr-FR')} pronostics
                            communauté
                          </p>
                        )}
                    </div>
                  </FastLink>
                </li>
              )
            })}
          </ul>
        </FadeIn>

        <FadeIn className="mt-8 text-center">
          <FastLink
            href="/ufc-pronostics"
            className="text-sm text-gold hover:underline underline-offset-4"
          >
            Tous les pronostics UFC →
          </FastLink>
        </FadeIn>
      </div>
    </section>
  )
}
