import { AuthLayout } from '@/components/layouts/AuthLayout'

export const metadata = {
  title: {
    template: '%s | NextFight',
    default: 'NextFight',
  },
}

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
