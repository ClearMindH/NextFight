import { LegalPageShell } from '@/components/legal/LegalPageShell'
import { CONTACT_EMAIL, getSiteName } from '@/lib/site'

export const metadata = {
  title: "Conditions générales d'utilisation",
}

export default function CguPage() {
  const siteName = getSiteName()

  return (
    <LegalPageShell title="Conditions générales d'utilisation">
      <section>
        <h2>Objet</h2>
        <p>
          Les présentes CGU régissent l&apos;accès au site {siteName} et à l&apos;abonnement Premium
          (pronostics MMA, analyses statistiques).
        </p>
      </section>
      <section>
        <h2>Abonnement</h2>
        <p>
          L&apos;abonnement est sans engagement de durée minimale, renouvelé automatiquement chaque
          période (mensuel ou annuel) jusqu&apos;à résiliation via le portail Stripe ou la page
          compte. Prix affichés TTC sur la page Tarifs.
        </p>
      </section>
      <section>
        <h2>Utilisation</h2>
        <p>
          Le contenu est strictement personnel et informatif. Interdiction de revente, scraping
          massif ou utilisation pour des paris sans discernement. {siteName} ne garantit pas
          l&apos;exactitude des résultats sportifs réels.
        </p>
      </section>
      <section>
        <h2>Résiliation</h2>
        <p>
          Vous pouvez annuler à tout moment ; l&apos;accès Premium reste actif jusqu&apos;à la fin
          de la période payée. Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
      <section>
        <h2>Droit applicable</h2>
        <p>Droit français. Tribunaux compétents du ressort de l&apos;éditeur, sauf disposition impérative contraire.</p>
      </section>
    </LegalPageShell>
  )
}
