import { CustomerLoginExperience } from '@/components/auth/CustomerLoginExperience'

export const metadata = { title: 'Inscription' }

export default function RegisterPage() {
  return <CustomerLoginExperience mode="register" />
}
