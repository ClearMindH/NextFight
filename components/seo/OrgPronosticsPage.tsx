import { FastLink } from '@/components/navigation/FastLink'
import { OrgPremiumLockedBanner } from '@/components/conversion/OrgPremiumLockedBanner'
import { OrgEventCalendar } from '@/components/pronostics/OrgEventCalendar'
import { OrgEventFightCardList } from '@/components/pronostics/OrgEventFightCardList'
import { OrgFeaturedFightSection } from '@/components/pronostics/OrgFeaturedFightSection'
import { OrgMainEventTeaser } from '@/components/pronostics/OrgMainEventTeaser'
import { OrgPageHeader } from '@/components/pronostics/OrgPageHeader'
import { PredictionsPreparingPanel } from '@/components/pronostics/PredictionsPreparingPanel'
import { UfcPronosticsPageContent } from '@/components/pronostics/ufc/UfcPronosticsPageContent'
import { PremiumAnalysisUnlock } from '@/components/premium/PremiumAnalysisUnlock'
import { OrgJsonLd } from '@/components/seo/OrgJsonLd'
import type { Organization } from '@/types'
import { getCompletedEventsByOrg, getUpcomingEventsByOrg, partitionEventsByPredictions } from '@/data/events-helpers'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { getPublicTrackRecord } from '@/lib/public-track-record'
import { buildPronosticsJsonLd } from '@/lib/seo-pronostics'
import { cn } from '@/utils/cn'
import { formatShortDate } from '@/utils/format'

interface OrgPronosticsPageProps {
  org: Organization
}

export function OrgPronosticsPage({ org }: OrgPronosticsPageProps) {
  const orgEvents = getUpcomingEventsByOrg(org.id)
  const lastCompleted = getCompletedEventsByOrg(org.id)[0]
  const { published, preparing } = partitionEventsByPredictions(orgEvents)
  const featured = published[0]
  const previewFight = featured ? getFreePreviewFight(featured) : null
  const jsonLd = buildPronosticsJsonLd(org, previewFight ?? null, featured ?? null)
  const isUfc = org.id === 'ufc'
  const lockedCount = featured ? featured.fights.length - 1 : 0
  const trackRecord = getPublicTrackRecord()

  return (
    <>
      <OrgJsonLd data={jsonLd} />
      <main
        className={cn(
          'flex flex-col pt-site-header pb-24 md:pb-0',
          isUfc ? 'bg-[#0a0a0a]' : 'bg-[#050505]',
        )}
      >
        {!isUfc && (
          <OrgPageHeader
            org={org}
            compactOnMobile={false}
          />
        )}

        {!featured && lastCompleted && (
          <section className="border-b border-white/[0.06]">
            <div className="container-content section-padding max-w-3xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                Dernière carte archivée
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {lastCompleted.name}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {formatShortDate(lastCompleted.date)} · événement terminé — pronostics figés et
                comparés aux résultats réels.
              </p>
              <FastLink
                href="/resultats"
                className="mt-5 inline-flex text-sm font-medium text-gold hover:underline underline-offset-4"
              >
                Voir le bilan sur cette carte →
              </FastLink>
            </div>
          </section>
        )}

        {featured && featured.fights.length > 0 && (
          <div className="relative z-10 flex flex-col">
            {isUfc ? (
              <UfcPronosticsPageContent event={featured} trackRecord={trackRecord} />
            ) : (
              <>
                <OrgFeaturedFightSection org={org} event={featured} lockedCount={lockedCount} />
                <OrgEventFightCardList org={org} event={featured} />
                <OrgMainEventTeaser org={org} event={featured} />
                <OrgPremiumLockedBanner event={featured} />
              </>
            )}
          </div>
        )}

        {preparing.map((event) => (
          <PredictionsPreparingPanel key={event.id} event={event} />
        ))}

        {!isUfc && (
          <OrgEventCalendar org={org} events={orgEvents} activeEventId={featured?.id} />
        )}

        {!isUfc && (
          <section className="relative z-0 section-padding border-t border-white/[0.06]">
            <div className="container-content max-w-3xl">
              <PremiumAnalysisUnlock />
            </div>
          </section>
        )}
      </main>
    </>
  )
}
