import { MarketingLayout } from '@/components/layouts/MarketingLayout'

/** Cache ISR — navigation rapide sans re-render serveur à chaque clic. */
export const revalidate = 120

export default function MarketingRouteLayout({ children }: { children: React.ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>
}
