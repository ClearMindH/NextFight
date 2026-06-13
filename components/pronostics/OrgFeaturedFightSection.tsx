'use client'

import type { Event, Organization } from '@/types'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import { OrgFightExperience } from '@/components/pronostics/OrgFightExperience'
import { UfcPrimaryCtaSection } from '@/components/conversion/UfcInlinePricingBlock'

interface OrgFeaturedFightSectionProps {
  org: Organization
  event: Event
  lockedCount?: number
}

export function OrgFeaturedFightSection({
  org,
  event,
  lockedCount = 0,
}: OrgFeaturedFightSectionProps) {
  const { isPremium } = useSubscription()
  const mainFight = getMainFight(event)
  const freeFight = getFreePreviewFight(event)
  const fight = isPremium ? (mainFight ?? freeFight) : freeFight

  if (!fight) return null

  const accessLabel = isPremium
    ? 'Combat à la une'
    : freeFight
      ? 'Co-main · pronostic gratuit'
      : 'Pronostic'

  const isUfcHub = org.id === 'ufc'

  return (
    <OrgFightExperience
      org={org}
      event={event}
      fight={fight}
      accessLabel={accessLabel}
      enforceAccess
      variant="preview"
      condensed={isUfcHub}
      afterVerdict={
        isUfcHub && lockedCount > 0 ? (
          <UfcPrimaryCtaSection lockedCount={lockedCount} variant="inline" />
        ) : undefined
      }
    />
  )
}
