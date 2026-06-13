import { FastLink } from '@/components/navigation/FastLink'
import { OrgPageHeader } from '@/components/pronostics/OrgPageHeader'
import { OrgFeaturedFightSection } from '@/components/pronostics/OrgFeaturedFightSection'
import { OrgEventFightCardList } from '@/components/pronostics/OrgEventFightCardList'
import { OrgEventCalendar } from '@/components/pronostics/OrgEventCalendar'
import { PredictionsPreparingPanel } from '@/components/pronostics/PredictionsPreparingPanel'
import { OrgJsonLd } from '@/components/seo/OrgJsonLd'
import type { Organization } from '@/types'
import { getUpcomingEventsByOrg, getCompletedEventsByOrg, partitionEventsByPredictions } from '@/data/events-helpers'
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

  return (
    <>
      <OrgJsonLd data={jsonLd} />
      <main className="flex flex-col pt-site-header bg-[#050505] pb-24 md:pb-0">
        <OrgPageHeader
          org={org}
          compactOnMobile={isUfc}
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
            {isUfc && (
              <div className="hidden md:block">
                <UfcPronosticsHeroBand />
                <div className="container-content px-4 pb-2 pt-4 sm:px-6 lg:px-8">
                  <EventCountdown className="mx-auto max-w-xl" />
                </div>
              </div>
            )}

            <OrgFeaturedFightSection org={org} event={featured} />
            <OrgEventFightCardList org={org} event={featured} />

            {isUfc ? (
              <>
                <div
                  id="ufc-pronos-content-end"
                  className="border-b border-white/[0.06] px-4 py-3 md:hidden"
                  aria-hidden
                >
                  <TrackRecordBadge />
                </div>
                <OrgMainEventTeaser org={org} event={featured} />
                <UfcPrimaryCtaSection lockedCount={lockedCount} />
                <div className="hidden md:block">
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
                <OrgMainEventTeaser org={org} event={featured} />
                <OrgPremiumLockedBanner event={featured} />
              </>
            )}
          </div>
        )}

        {preparing.map((event) => (
          <PredictionsPreparingPanel key={event.id} event={event} />
        ))}

        <OrgEventCalendar org={org} events={orgEvents} activeEventId={featured?.id} />

        <section className="relative z-0 section-padding border-t border-white/[0.06]">
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
