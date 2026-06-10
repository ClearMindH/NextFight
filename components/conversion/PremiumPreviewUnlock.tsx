'use client'

import Link from 'next/link'

type PremiumPreviewUnlockProps = {
  otherFightsCount: number
}

export function PremiumPreviewUnlock({ otherFightsCount }: PremiumPreviewUnlockProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505]/70 px-6 text-center">
      <span className="text-4xl" aria-hidden>
        🔒
      </span>
      <p className="mt-4 text-sm font-medium text-[#f5f2eb] sm:text-base">
        Topuria vs Gaethje
        {otherFightsCount > 0
          ? ` + ${otherFightsCount} autre${otherFightsCount > 1 ? 's' : ''} combat${otherFightsCount > 1 ? 's' : ''}`
          : ''}
      </p>
      <Link
        href="/pricing"
        className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-transform hover:scale-[1.02]"
      >
        Débloquer pour 9,99€/mois
      </Link>
    </div>
  )
}
