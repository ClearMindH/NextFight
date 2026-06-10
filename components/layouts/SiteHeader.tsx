'use client'

import { EventUrgencyBanner } from '@/components/conversion/EventUrgencyBanner'
import { Navbar } from '@/components/Navbar'
import { EVENT_URGENCY_BANNER_HEIGHT_PX, isEventUrgencyBannerActive } from '@/lib/event-urgency'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const [bannerActive, setBannerActive] = useState(false)

  useEffect(() => {
    setBannerActive(isEventUrgencyBannerActive())
  }, [])

  return (
    <>
      <EventUrgencyBanner />
      <Navbar topOffset={bannerActive ? EVENT_URGENCY_BANNER_HEIGHT_PX : 0} />
    </>
  )
}
