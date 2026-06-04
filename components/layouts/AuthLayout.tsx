import Link from 'next/link'
import { NextFightBrand } from '@/components/NextFightBrand'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f2eb] flex flex-col">
      <header className="relative z-20 border-b border-[#1a1a1a]">
        <div className="container-content flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <NextFightBrand
            iconSize="sm"
            wordmarkClassName="text-sm font-medium text-[#f5f2eb] group-hover:text-[#c9b896]"
          />
          <Link
            href="/ufc-pronostics"
            className="text-[11px] uppercase tracking-[0.16em] text-[#5c5c5c] hover:text-[#f5f2eb] transition-colors"
          >
            Pronostics
          </Link>
        </div>
      </header>
      <main className="relative flex-1 flex items-stretch">{children}</main>
    </div>
  )
}
