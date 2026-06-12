'use client'

import { UfcExitIntentModal } from '@/components/conversion/UfcExitIntentModal'
import { UfcMobileFloatingCta } from '@/components/conversion/UfcMobileFloatingCta'
import type { Event } from '@/types'

type UfcPronosticsConversionProps = {
  event: Event
  lockedCount?: number
  scrollAnchorId?: string
}

export function UfcPronosticsConversion({
  event: _event,
  lockedCount = 6,
  scrollAnchorId,
}: UfcPronosticsConversionProps) {
  return (
    <>
      <UfcExitIntentModal />
      <UfcMobileFloatingCta lockedCount={lockedCount} scrollAnchorId={scrollAnchorId} />
    </>
  )
}
