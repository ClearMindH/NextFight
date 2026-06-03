import Link from 'next/link'

export default function FightNotFound() {
  return (
    <div className="container-content section-padding text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Combat introuvable</h1>
      <p className="mt-3 text-muted text-sm">Ce matchup n&apos;est pas encore dans notre base.</p>
      <Link
        href="/ufc-pronostics"
        className="mt-8 inline-block text-sm text-gold hover:underline underline-offset-4"
      >
        Voir les pronostics UFC →
      </Link>
    </div>
  )
}
