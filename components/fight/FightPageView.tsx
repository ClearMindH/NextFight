'use client'

import { useEffect } from 'react'
import { FastLink } from '@/components/navigation/FastLink'
import { ArrowLeft } from 'lucide-react'
import type { FightPageData } from '@/lib/fights'
import { OrgFightExperience } from '@/components/pronostics/OrgFightExperience'
import { UnlockCardPremiumCTA } from '@/components/pronostics/UnlockCardPremiumCTA'
import { OrgEventCalendar } from '@/components/pronostics/OrgEventCalendar'
import { OrgEventFightCardList } from '@/components/pronostics/OrgEventFightCardList'
import {
  canAccessFightPrediction,
} from '@/lib/fight-access'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserActivity } from '@/hooks/useUserActivity'
import { FightPremiumTeaser } from '@/components/conversion/FightPremiumTeaser'

interface FightPageViewProps {
  data: FightPageData
}

export function FightPageView({ data }: FightPageViewProps) {
  const { isPremium } = useSubscription()
  const { trackPredictionView } = useUserActivity()
  const { fight, event, organization, orgEvents } = data
  const hasFullPrediction = canAccessFightPrediction(fight, event, isPremium)
  const freeFight = getFreePreviewFight(event)
  const isFreeFightPage = freeFight?.id === fight.id && !isPremium

  useEffect(() => {
    if (hasFullPrediction) trackPredictionView(fight.id, event.id)
  }, [fight.id, event.id, trackPredictionView, hasFullPrediction])

  const accessLabel = fight.isMainEvent
    ? 'Main event'
    : fight.order === 2
      ? 'Co-main'
      : `Combat ${fight.order}`

  return (
    <div className="min-h-screen bg-[#050505] pt-site-header">
      <div className="container-content border-b border-white/[0.06] px-4 py-6 sm:px-6 lg:px-8">
        <FastLink
          href={`${organization.seoPathFr}#pronostic`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pronostics {organization.name}
        </FastLink>
      </div>

      <OrgFightExperience
        org={organization}
        event={event}
        fight={fight}
        accessLabel={accessLabel}
        enforceAccess
        variant="detail"
        afterVerdict={
          isFreeFightPage ? (
            <UnlockCardPremiumCTA event={event} variant="banner" className="mt-2" />
          ) : undefined
        }
      />

      <FightPremiumTeaser event={event} fightId={fight.id} />

      <OrgEventFightCardList org={organization} event={event} excludeFightId={fight.id} />

      <OrgEventCalendar
        org={organization}
        events={orgEvents}
        activeEventId={event.id}
      />
    </div>
  )
}
