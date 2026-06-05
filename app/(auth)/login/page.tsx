import { CustomerLoginExperience } from '@/components/auth/CustomerLoginExperience'
import { isMagicLinkCustomerAuth } from '@/lib/site'

export const metadata = { title: 'Connexion' }

export default function LoginPage() {
  return (
    <CustomerLoginExperience mode="login" magicLinkAuth={isMagicLinkCustomerAuth()} />
  )
}
