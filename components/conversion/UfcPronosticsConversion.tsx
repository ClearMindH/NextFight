'use client'

import { OrgPremiumLockedBanner } from '@/components/conversion/OrgPremiumLockedBanner'
import { UfcExitIntentModal } from '@/components/conversion/UfcExitIntentModal'
import { UfcMobileFloatingCta } from '@/components/conversion/UfcMobileFloatingCta'
import type { Event } from '@/types'

type UfcPronosticsConversionProps = {
  event: Event
  showBanner?: boolean
}

export function UfcPronosticsConversion({ event, showBanner }: UfcPronosticsConversionProps) {
  return (
    <>
      {showBanner && <OrgPremiumLockedBanner event={event} />}
      <UfcExitIntentModal />
      <UfcMobileFloatingCta />
    </>
  )
}
