import { CustomerLoginExperience } from '@/components/auth/CustomerLoginExperience'
import { sanitizeAuthRedirectPath } from '@/lib/auth-magic-link'
import { isMagicLinkCustomerAuth } from '@/lib/site'

export const metadata = { title: 'Connexion' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return (
    <CustomerLoginExperience
      mode="login"
      magicLinkAuth={isMagicLinkCustomerAuth()}
      redirectNext={sanitizeAuthRedirectPath(next)}
    />
  )
}
