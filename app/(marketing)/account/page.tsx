import { AccountClient } from '@/components/account/AccountClient'

export const metadata = {
  title: 'Mon compte',
  description: 'Gérez votre abonnement Premium NextFight.',
}

export default function AccountPage() {
  return (
    <div className="min-h-screen section-padding pt-24 pb-20 bg-[#050505]">
      <div className="container-content">
        <AccountClient />
      </div>
    </div>
  )
}
