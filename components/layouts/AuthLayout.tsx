import Link from 'next/link'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container-content flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-background text-xs font-bold">
              NF
            </span>
            NextFight
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
