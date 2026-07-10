import { LandingAnnouncement } from '@/components/LandingAnnouncement'
import { HomeFeaturedPredictions } from '@/components/home/HomeFeaturedPredictions'
import { HowItWorks } from '@/components/HowItWorks'
import { SocialProofSection } from '@/components/conversion/SocialProofSection'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'
import { getEvents } from '@/data/events'
import { FEATURED_UFC_EVENT_ID } from '@/lib/event-urgency'
import { getPublicTrackRecord } from '@/lib/public-track-record'

export default function HomePage() {
  const event = getEvents().find((e) => e.id === FEATURED_UFC_EVENT_ID)
  const trackRecord = getPublicTrackRecord()

  return (
    <main>
      <LandingAnnouncement />
      {event ? (
        <HomeFeaturedPredictions event={event} trackRecord={trackRecord} />
      ) : null}
      <HowItWorks />
      <SocialProofSection />
      <UpcomingEvents />
      <Pricing />
      <FAQ />
    </main>
  )
}
