import Link from 'next/link'

export const metadata = { title: 'Legal' }

export default function LegalPage() {
  return (
    <main className="pt-24 section-padding container-content max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Legal</h1>
      <p className="mt-6 text-muted text-sm leading-relaxed">
        NextFight provides MMA analytics and predictive modeling for informational purposes.
        We are not a gambling operator. All trademarks belong to their respective owners.
      </p>
      <Link href="/" className="mt-8 inline-block text-sm text-gold hover:underline">
        ← Back to home
      </Link>
    </main>
  )
}
