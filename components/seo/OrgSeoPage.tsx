import Link from 'next/link'
import { PredictionCard } from '@/components/PredictionCard'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import type { Organization } from '@/types'
import { getEventsByOrg } from '@/data/events'
import { getFreePreviewFight } from '@/lib/event-helpers'

interface OrgSeoPageProps {
  org: Organization
}

export function OrgSeoPage({ org }: OrgSeoPageProps) {
  const orgEvents = getEventsByOrg(org.id)
  const featured = orgEvents[0]
  const mainFight = featured ? getFreePreviewFight(featured) : null

  return (
    <main className="pt-site-header">
      <section className="section-padding border-b border-border">
        <div className="container-content max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{org.name}</p>
            <Link
              href={org.seoPathFr}
              className="text-xs text-muted transition-colors hover:text-foreground"
            >
              Français
            </Link>
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            {org.name} Predictions & Fight Previews
          </h1>
          <p className="mt-4 text-muted leading-relaxed">{org.description}</p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
          >
            Unlock {org.name} Premium Reports
          </Link>
        </div>
      </section>

      {mainFight && (
        <section className="section-padding">
          <div className="container-content max-w-4xl">
            <h2 className="font-display text-xl font-semibold mb-6">Pronostic à la une</h2>
            <PredictionCard fight={mainFight} organizationLabel={`${org.name} · Co-main (gratuit)`} />
          </div>
        </section>
      )}

      <UpcomingEvents />
    </main>
  )
}
