import { FastLink } from '@/components/navigation/FastLink'
import { NextFightBrand } from '@/components/NextFightBrand'
import { organizations } from '@/data/organizations'
import { getOrgEventFlag } from '@/lib/org-flag'

const footerNav = {
  Pronostics: organizations.map((o) => ({
    href: o.seoPathFr,
    orgId: o.id,
  })),
  Site: [
    { href: '/#events', label: 'Combats à venir' },
    { href: '/pricing', label: 'Tarifs' },
    { href: '/account', label: 'Mon compte' },
    { href: '/contact', label: 'Contact' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgu', label: 'CGU' },
    { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  ],
}

function FooterOrgLink({ orgId, href }: { orgId: string; href: string }) {
  const org = organizations.find((o) => o.id === orgId)
  if (!org) return null
  const { emoji, regionLabel } = getOrgEventFlag(org.id)

  return (
    <FastLink
      href={href}
      className="inline-flex items-center gap-2 py-0.5 text-sm text-muted transition-colors hover:text-foreground"
    >
      <span className="text-base leading-none" title={regionLabel} aria-hidden>
        {emoji}
      </span>
      <span className="font-display font-medium tracking-tight">
        {org.id === 'hexagone' ? 'Hexagone MMA' : org.name}
      </span>
    </FastLink>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container-content section-padding pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <NextFightBrand href={null} iconSize="md" />
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Pronostics MMA et analyses statistiques pour les grandes organisations. Outil informatif —
              pas de paris sportifs.
            </p>
          </div>

          {Object.entries(footerNav).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    {'orgId' in item ? (
                      <FooterOrgLink orgId={item.orgId} href={item.href} />
                    ) : (
                      <FastLink
                        href={item.href}
                        className="inline-block py-0.5 text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </FastLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-border pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} NextFight. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
