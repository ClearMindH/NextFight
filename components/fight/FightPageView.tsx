'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { FightPageData } from '@/lib/fights'
import { OrgFightExperience } from '@/components/pronostics/OrgFightExperience'
import { OrgEventCalendar } from '@/components/pronostics/OrgEventCalendar'
import { OrgEventFightCardList } from '@/components/pronostics/OrgEventFightCardList'
import {
  canAccessFightPrediction,
} from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserActivity } from '@/hooks/useUserActivity'

interface FightPageViewProps {
  data: FightPageData
}

export function FightPageView({ data }: FightPageViewProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const { trackPredictionView } = useUserActivity()
  const { fight, event, organization, orgEvents } = data
  const hasFullPrediction = canAccessFightPrediction(fight, event, isPremium)

  useEffect(() => {
    if (hasFullPrediction) trackPredictionView(fight.id, event.id)
  }, [fight.id, event.id, trackPredictionView, hasFullPrediction])

  const accessLabel = fight.isMainEvent
    ? 'Main event'
    : fight.order === 2
      ? 'Co-main'
      : `Combat ${fight.order}`

  return (
    <div className="min-h-screen bg-[#050505] pt-16">
      <div className="container-content border-b border-white/[0.06] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={`${organization.seoPathFr}#pronostic`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pronostics {organization.name}
        </Link>
      </div>

      {!subLoading && (
        <OrgFightExperience
          org={organization}
          event={event}
          fight={fight}
          accessLabel={accessLabel}
          enforceAccess
          variant="detail"
        />
      )}

      <OrgEventFightCardList org={organization} event={event} excludeFightId={fight.id} />

      <OrgEventCalendar
        org={organization}
        events={orgEvents}
        activeEventId={event.id}
      />
    </div>
  )
}
