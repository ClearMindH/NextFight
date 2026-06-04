'use client'

import { organizations } from '@/data/organizations'
import { PromotionOrgCard } from '@/components/PromotionOrgCard'
import { useEvents } from '@/hooks/useEvents'
import { FadeIn } from '@/components/motion/FadeIn'

export function Promotions() {
  const { events } = useEvents()

  const nextByOrg = Object.fromEntries(
    organizations.map((org) => {
      const upcoming = events
        .filter((e) => e.organizationId === org.id && e.status === 'upcoming')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      return [org.id, upcoming[0]]
    }),
  )

  return (
    <section id="promotions" className="relative overflow-hidden intel-dashboard-section">
      <div className="pointer-events-none absolute inset-0 intel-dashboard-grid opacity-60" />

      <div className="container-content relative section-padding">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
            Promotions
          </p>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Pronostics par organisation
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Une page par promotion avec calendrier, pronostics et analyses — interface claire et
            lisible.
          </p>
        </FadeIn>

        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {organizations.map((org, i) => (
            <PromotionOrgCard
              key={org.id}
              org={org}
              nextEvent={nextByOrg[org.id]}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
