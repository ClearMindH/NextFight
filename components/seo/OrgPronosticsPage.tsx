import { FastLink } from '@/components/navigation/FastLink'
import { OrgPageHeader } from '@/components/pronostics/OrgPageHeader'
import { OrgFeaturedFightSection } from '@/components/pronostics/OrgFeaturedFightSection'
import { OrgEventFightCardList } from '@/components/pronostics/OrgEventFightCardList'
import { OrgEventCalendar } from '@/components/pronostics/OrgEventCalendar'
import { PredictionsPreparingPanel } from '@/components/pronostics/PredictionsPreparingPanel'
import { OrgJsonLd } from '@/components/seo/OrgJsonLd'
import type { Organization } from '@/types'
import { getUpcomingEventsByOrg, partitionEventsByPredictions } from '@/data/events-helpers'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { buildPronosticsJsonLd } from '@/lib/seo-pronostics'
import { EventCountdown } from '@/components/conversion/EventCountdown'
import { UfcPronosticsConversion } from '@/components/conversion/UfcPronosticsConversion'

interface OrgPronosticsPageProps {
  org: Organization
}

export function OrgPronosticsPage({ org }: OrgPronosticsPageProps) {
  const orgEvents = getUpcomingEventsByOrg(org.id)
  const { published, preparing } = partitionEventsByPredictions(orgEvents)
  const featured = published[0]
  const previewFight = featured ? getFreePreviewFight(featured) : null
  const jsonLd = buildPronosticsJsonLd(org, previewFight ?? null, featured ?? null)

  return (
    <>
      <OrgJsonLd data={jsonLd} />
      <main className={org.id === 'ufc' ? 'pb-24 pt-site-header bg-[#050505] md:pb-0' : 'pt-site-header bg-[#050505]'}>
        <OrgPageHeader org={org} />

        {org.id === 'ufc' && (
          <div className="container-content px-4 pb-2 pt-4 sm:px-6 lg:px-8">
            <EventCountdown className="mx-auto max-w-xl" />
          </div>
        )}

        {featured && featured.fights.length > 0 && (
          <>
            <OrgFeaturedFightSection org={org} event={featured} />
            {org.id === 'ufc' ? (
              <UfcPronosticsConversion event={featured} showBanner />
            ) : null}
            <OrgEventFightCardList org={org} event={featured} />
          </>
        )}

        {preparing.map((event) => (
          <PredictionsPreparingPanel key={event.id} event={event} />
        ))}

        <OrgEventCalendar org={org} events={orgEvents} activeEventId={featured?.id} />

        <section className="section-padding">
          <div className="container-content max-w-3xl">
            <h2 className="font-display text-xl font-semibold tracking-tight">Premium</h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Accédez à tous les combats de la carte, y compris le main event, et aux analyses
              détaillées.
            </p>
            <FastLink
              href="/pricing"
              className="mt-6 inline-flex rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              Voir les offres
            </FastLink>
          </div>
        </section>
      </main>
    </>
  )
}
