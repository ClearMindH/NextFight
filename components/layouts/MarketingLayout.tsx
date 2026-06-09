import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { NavigationProgress } from '@/components/navigation/NavigationProgress'
import { RoutePrefetcher } from '@/components/navigation/RoutePrefetcher'
import { getUpcomingEventsSorted } from '@/data/events-helpers'

const fightPrefetchRoutes = getUpcomingEventsSorted().flatMap((event) =>
  event.fights.map((fight) => `/fight/${fight.id}`),
)

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationProgress />
      <RoutePrefetcher extraRoutes={fightPrefetchRoutes} />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
