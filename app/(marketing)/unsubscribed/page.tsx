import Link from 'next/link'

export const metadata = {
  title: 'Désabonnement confirmé',
}

export default function UnsubscribedPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-24 section-padding flex items-center justify-center">
      <div className="container-content max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f5f2eb]">
          Désabonnement confirmé
        </h1>
        <p className="mt-4 text-sm text-[#8a8278] leading-relaxed">
          Vous ne recevrez plus d&apos;emails marketing de notre part. Votre abonnement Premium,
          s&apos;il était actif, a été annulé selon les conditions Stripe.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-gold hover:border-gold/40"
        >
          Retour aux pronostics
        </Link>
      </div>
    </main>
  )
}
