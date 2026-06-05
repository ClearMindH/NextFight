import { LegalPageShell } from '@/components/legal/LegalPageShell'
import { CONTACT_EMAIL, getSiteName } from '@/lib/site'

export const metadata = {
  title: 'Politique de confidentialité',
}

export default function PolitiqueConfidentialitePage() {
  const siteName = getSiteName()

  return (
    <LegalPageShell title="Politique de confidentialité">
      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Adresse e-mail (compte, abonnement, contact)</li>
          <li>Données de paiement traitées par Stripe (nous ne stockons pas les numéros de carte)</li>
          <li>Données techniques (logs, cookies essentiels, analytics si activés)</li>
        </ul>
      </section>
      <section>
        <h2>Finalités</h2>
        <p>
          Gestion du compte et de l&apos;abonnement Premium, envoi d&apos;emails transactionnels,
          support client, amélioration du service {siteName}.
        </p>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>
          Données de compte : durée de la relation contractuelle puis 3 ans à des fins de preuve.
          Facturation : 10 ans (obligations comptables). Emails marketing : jusqu&apos;au désabonnement.
        </p>
      </section>
      <section>
        <h2>Vos droits (RGPD)</h2>
        <p>
          Accès, rectification, effacement, limitation, portabilité et opposition : contactez{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Vous pouvez introduire une
          réclamation auprès de la CNIL.
        </p>
      </section>
      <section>
        <h2>Sous-traitants</h2>
        <p>Stripe (paiements), Vercel (hébergement), Resend (emails), Supabase (données abonnés).</p>
      </section>
    </LegalPageShell>
  )
}
