'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#050505] text-foreground">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Erreur</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Impossible d’afficher cette page</h1>
      <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">
        Le serveur a rencontré un problème. Rechargez la page ou redémarrez{' '}
        <code className="text-foreground/80">npm run dev -- -p 3010</code> si le problème
        persiste.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-[#050505]"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-2.5 text-sm text-muted hover:text-foreground"
        >
          Accueil
        </Link>
      </div>
    </main>
  )
}
