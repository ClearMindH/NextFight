import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm'
import { AuthLink } from '@/components/auth/AuthCard'

export const metadata = { title: 'Connexion' }

export default function LoginPage() {
  return (
    <div className="section-padding pt-24">
      <div className="container-content max-w-md mx-auto">
        <CustomerLoginForm
          title="Connexion"
          subtitle="Gérez votre abonnement Premium et accédez aux pronostics détaillés."
          submitLabel="Se connecter"
          footer={
            <>
              Pas encore Premium ? <AuthLink href="/pricing">Voir les offres</AuthLink>
            </>
          }
        />
      </div>
    </div>
  )
}
