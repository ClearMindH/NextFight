'use client'

import { UfcExitIntentModal } from '@/components/conversion/UfcExitIntentModal'
import { UfcMobileFloatingCta } from '@/components/conversion/UfcMobileFloatingCta'
import type { Event } from '@/types'

type UfcPronosticsConversionProps = {
  event: Event
}

export function UfcPronosticsConversion({ event: _event }: UfcPronosticsConversionProps) {
  return (
    <>
      <UfcExitIntentModal />
      <UfcMobileFloatingCta />
    </>
  )
}
