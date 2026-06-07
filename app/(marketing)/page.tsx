import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { LandingAnnouncement } from '@/components/LandingAnnouncement'
import { Promotions } from '@/components/Promotions'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'

export default function HomePage() {
  return (
    <main>
      <LandingAnnouncement />
      <Hero />
      <HowItWorks />
      <Promotions />
      <UpcomingEvents />
      <Pricing />
      <FAQ />
    </main>
  )
}
