import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-[#f5f2eb]">404</h1>
      <p className="mt-3 text-muted">Ce combat n&apos;existe pas dans nos archives.</p>
      <Link
        href="/ufc-pronostics"
        className="mt-8 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-gold hover:border-gold/40"
      >
        Retour aux pronostics
      </Link>
    </main>
  )
}
