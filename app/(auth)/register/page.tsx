import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm'
import { AuthLink } from '@/components/auth/AuthCard'

export const metadata = { title: 'Inscription' }

export default function RegisterPage() {
  return (
    <div className="section-padding pt-24">
      <div className="container-content max-w-md mx-auto">
        <CustomerLoginForm
          title="Créer un compte"
          subtitle="En local, la connexion utilise votre email et le mot de passe admin (ADMIN_SECRET)."
          submitLabel="Accéder au compte"
          footer={
            <>
              Déjà membre ? <AuthLink href="/login">Connexion</AuthLink>
            </>
          }
        />
        <p className="mt-4 text-xs text-muted text-center leading-relaxed">
          NextFight est un outil de pronostics informatifs — pas une plateforme de paris sportifs.
        </p>
      </div>
    </div>
  )
}
