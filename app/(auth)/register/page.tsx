import { redirect } from 'next/navigation'
import { CustomerLoginExperience } from '@/components/auth/CustomerLoginExperience'
import { sanitizeAuthRedirectPath } from '@/lib/auth-magic-link'
import { isMagicLinkCustomerAuth } from '@/lib/site'

export const metadata = { title: 'Inscription' }

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const redirectNext = sanitizeAuthRedirectPath(next)

  if (isMagicLinkCustomerAuth()) {
    const query = redirectNext ? `?next=${encodeURIComponent(redirectNext)}` : ''
    redirect(`/login${query}`)
  }

  return (
    <CustomerLoginExperience mode="register" redirectNext={redirectNext} />
  )
}
