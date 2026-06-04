'use client'

import type { Event, Organization } from '@/types'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import { OrgFightExperience } from '@/components/pronostics/OrgFightExperience'

interface OrgFeaturedFightSectionProps {
  org: Organization
  event: Event
}

export function OrgFeaturedFightSection({ org, event }: OrgFeaturedFightSectionProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const mainFight = getMainFight(event)
  const freeFight = getFreePreviewFight(event)
  const fight =
    subLoading || isPremium
      ? (mainFight ?? freeFight)
      : (freeFight ?? mainFight)

  if (!fight) return null

  const accessLabel = isPremium
    ? 'Combat à la une'
    : freeFight
      ? 'Co-main · pronostic gratuit'
      : 'Pronostic'

  return (
    <OrgFightExperience
      org={org}
      event={event}
      fight={fight}
      accessLabel={accessLabel}
      enforceAccess={false}
    />
  )
}
