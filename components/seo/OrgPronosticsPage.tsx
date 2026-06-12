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
import { OrgPremiumLockedBanner } from '@/components/conversion/OrgPremiumLockedBanner'
import { OrgMainEventTeaser } from '@/components/pronostics/OrgMainEventTeaser'
import { PremiumAnalysisUnlock } from '@/components/premium/PremiumAnalysisUnlock'
import { TrackRecordBadge } from '@/components/conversion/TrackRecordBadge'
import { UfcAboveFoldCta } from '@/components/conversion/UfcAboveFoldCta'
import { UfcPrimaryCtaSection } from '@/components/conversion/UfcInlinePricingBlock'
import { UfcPronosticsConversion } from '@/components/conversion/UfcPronosticsConversion'
import { UfcPronosticsHeroBand } from '@/components/conversion/UfcPronosticsHeroBand'

interface OrgPronosticsPageProps {
  org: Organization
}

export function OrgPronosticsPage({ org }: OrgPronosticsPageProps) {
  const orgEvents = getUpcomingEventsByOrg(org.id)
  const { published, preparing } = partitionEventsByPredictions(orgEvents)
  const featured = published[0]
  const previewFight = featured ? getFreePreviewFight(featured) : null
  const jsonLd = buildPronosticsJsonLd(org, previewFight ?? null, featured ?? null)
  const isUfc = org.id === 'ufc'
  const lockedCount = featured ? featured.fights.length - 1 : 0

  return (
    <>
      <OrgJsonLd data={jsonLd} />
      <main
        className={
          isUfc
            ? 'flex flex-col pb-24 pt-site-header bg-[#050505] md:pb-0'
            : 'flex flex-col pt-site-header bg-[#050505]'
        }
      >
        <OrgPageHeader
          org={org}
          compactOnMobile={isUfc}
          className="order-0"
          afterTitle={
            isUfc && featured && lockedCount > 0 ? (
              <div className="hidden md:block">
                <UfcAboveFoldCta lockedCount={lockedCount} />
              </div>
            ) : undefined
          }
          belowTitle={
            isUfc ? (
              <div className="hidden md:block">
                <TrackRecordBadge />
              </div>
            ) : undefined
          }
        />

        {isUfc && featured && (
          <div className="order-1 hidden md:block">
            <UfcPronosticsHeroBand />
            <div className="container-content px-4 pb-2 pt-4 sm:px-6 lg:px-8">
              <EventCountdown className="mx-auto max-w-xl" />
            </div>
          </div>
        )}

        {featured && featured.fights.length > 0 && (
          <>
            <div className={isUfc ? 'order-1 md:order-2' : 'order-1'}>
              <OrgFeaturedFightSection org={org} event={featured} />
            </div>

            <div className={isUfc ? 'order-2 md:order-6' : 'order-2'}>
              <OrgEventFightCardList org={org} event={featured} />
            </div>

            {isUfc ? (
              <>
                <div
                  id="ufc-pronos-content-end"
                  className="order-3 border-b border-white/[0.06] px-4 py-3 md:hidden"
                  aria-hidden
                >
                  <TrackRecordBadge />
                </div>

                <div className="order-4 md:order-4">
                  <OrgMainEventTeaser org={org} event={featured} />
                </div>

                <div className="order-5 md:order-3">
                  <UfcPrimaryCtaSection lockedCount={lockedCount} />
                </div>

                <div className="order-6 hidden md:order-5 md:block">
                  <OrgPremiumLockedBanner event={featured} />
                </div>

                <UfcPronosticsConversion
                  event={featured}
                  lockedCount={lockedCount}
                  scrollAnchorId="ufc-pronos-content-end"
                />
              </>
            ) : (
              <>
                <div className="order-3">
                  <OrgMainEventTeaser org={org} event={featured} />
                </div>
                <div className="order-4">
                  <OrgPremiumLockedBanner event={featured} />
                </div>
              </>
            )}
          </>
        )}

        {preparing.map((event) => (
          <PredictionsPreparingPanel key={event.id} event={event} />
        ))}

        <OrgEventCalendar org={org} events={orgEvents} activeEventId={featured?.id} />

        <section className="section-padding border-t border-white/[0.06]">
          <div className="container-content max-w-3xl">
            <PremiumAnalysisUnlock />
            {org.id !== 'ufc' && (
              <p className="mt-4 text-center text-xs text-muted">
                <FastLink href="/resultats" className="hover:text-foreground transition-colors">
                  Consulter le bilan transparent des pronostics passés →
                </FastLink>
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
