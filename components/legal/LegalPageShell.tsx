import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalPageShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#050505] pt-24 section-padding pb-20">
      <article className="container-content max-w-2xl prose prose-invert prose-sm prose-headings:font-display prose-headings:tracking-tight prose-p:text-muted prose-li:text-muted">
        <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed">{children}</div>
        <Link href="/" className="mt-10 inline-block text-sm text-gold hover:underline no-underline">
          ← Retour à l&apos;accueil
        </Link>
      </article>
    </main>
  )
}
