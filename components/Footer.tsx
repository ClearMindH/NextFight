import Link from 'next/link'
import { organizations } from '@/data/organizations'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'

const footerNav = {
  Pronostics: organizations.map((o) => ({
    href: o.seoPathFr,
    label: `${o.name}`,
  })),
  Site: [
    { href: '/#events', label: 'Combats à venir' },
    { href: '/pricing', label: 'Tarifs' },
    { href: '/account', label: 'Mon compte' },
    { href: '/legal', label: 'Mentions légales' },
  ],
}

const social = [
  { href: 'https://twitter.com', label: 'X' },
  { href: 'https://linkedin.com', label: 'LinkedIn' },
  { href: 'https://youtube.com', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container-content section-padding pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">NextFight</p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Pronostics MMA et analyses statistiques pour les grandes promotions. Outil informatif —
              pas de paris sportifs.
            </p>
            <div className="mt-4 flex gap-4">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-gold transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerNav).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
              <ul className="mt-4 space-y-2">
                {items.map((item) => {
                  const org = organizations.find((o) => o.seoPathFr === item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-block py-0.5 transition-opacity hover:opacity-90"
                      >
                        {org ? (
                          <OrgBrandLogo orgId={org.id} size="sm" glow="soft" className="origin-left" />
                        ) : (
                          <span className="text-sm text-muted hover:text-foreground">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
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
