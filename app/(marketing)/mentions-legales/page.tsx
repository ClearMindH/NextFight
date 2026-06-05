import { LegalPageShell } from '@/components/legal/LegalPageShell'
import { CONTACT_EMAIL, getSiteName, getSiteUrl } from '@/lib/site'

export const metadata = {
  title: 'Mentions légales',
}

export default function MentionsLegalesPage() {
  const siteName = getSiteName()
  const siteUrl = getSiteUrl()

  return (
    <LegalPageShell title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          {siteName} — service édité à titre informatif.
          <br />
          Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <br />
          Site : <a href={siteUrl}>{siteUrl}</a>
        </p>
      </section>
      <section>
        <h2>Hébergeur</h2>
        <p>
          Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
        </p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Textes, analyses et éléments graphiques du site sont la propriété de {siteName}, sauf
          marques et logos des promotions MMA citées (UFC, PFL, KSW, ARES, Hexagone MMA, etc.)
          qui appartiennent à leurs détenteurs respectifs.
        </p>
      </section>
      <section>
        <h2>Responsabilité</h2>
        <p>
          Les pronostics sont fournis à titre informatif et ne constituent pas un conseil en paris
          sportifs. {siteName} n&apos;est pas opérateur de jeux d&apos;argent.
        </p>
      </section>
    </LegalPageShell>
  )
}
