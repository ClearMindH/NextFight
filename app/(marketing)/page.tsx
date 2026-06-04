import { Hero } from '@/components/Hero'
import { Promotions } from '@/components/Promotions'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Promotions />
      <UpcomingEvents />
      <Pricing />
      <FAQ />
    </main>
  )
}
