import { AccountClient } from '@/components/account/AccountClient'

export const metadata = {
  title: 'Mon compte',
  description: 'Gérez votre abonnement Premium NextFight.',
}

export default function AccountPage() {
  return (
    <div className="section-padding pt-24">
      <div className="container-content">
        <AccountClient />
      </div>
    </div>
  )
}
