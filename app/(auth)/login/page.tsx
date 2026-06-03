import { CustomerLoginExperience } from '@/components/auth/CustomerLoginExperience'

export const metadata = { title: 'Connexion' }

export default function LoginPage() {
  return <CustomerLoginExperience mode="login" />
}
