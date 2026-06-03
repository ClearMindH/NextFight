import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="container-content section-padding max-w-lg mx-auto text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Paiement annulé</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Aucun changement effectué
      </h1>
      <p className="mt-3 text-muted text-sm">
        Vous pouvez réessayer quand vous voulez depuis la page tarifs.
      </p>
      <Link
        href="/pricing"
        className="mt-8 inline-block rounded-full border border-gold/40 px-8 py-3 text-sm text-gold hover:bg-gold/5 transition-colors"
      >
        Retour aux offres
      </Link>
    </div>
  )
}
