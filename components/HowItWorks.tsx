import Link from 'next/link'

export function HowItWorks() {
  return (
    <section className="section-padding border-b border-border">
      <div className="container-content">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Comment ça marche
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Des données réelles, une décision claire.
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Statistiques réelles, face-à-face des combattants, probabilité de victoire. Tout ce
            qu&apos;il faut pour suivre ou anticiper un combat.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="#promotions"
            className="text-sm font-medium text-gold transition-colors hover:text-foreground"
          >
            Parcourir les organisations →
          </Link>
        </div>
      </div>
    </section>
  )
}
