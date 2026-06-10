import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { PremiumPreviewUnlock } from '@/components/conversion/PremiumPreviewUnlock'
import { getFightPageData } from '@/lib/fights'
import { formatPercent } from '@/utils/format'

const FREE_FIGHT_ID = 'ufc-freedom-250-f2'
const PREMIUM_FIGHT_ID = 'ufc-freedom-250-f1'

export function PremiumPreviewSection() {
  const freeData = getFightPageData(FREE_FIGHT_ID)
  const premiumData = getFightPageData(PREMIUM_FIGHT_ID)

  if (!freeData || !premiumData) return null

  const { fight: freeFight } = freeData
  const { fight: premiumFight, event } = premiumData

  return (
    <section className="border-t border-[#1a1816]">
      <div className="container-content section-padding">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
            Ce que vous débloquez avec Premium
          </h2>
          <p className="mt-3 text-sm text-[#8a8278]">
            À gauche : l&apos;aperçu gratuit. À droite : le main event UFC Freedom 250 réservé aux
            abonnés.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Gratuit — Gane vs Pereira */}
          <article className="relative rounded-2xl border border-emerald-900/40 bg-[#0a0f0c] p-6">
            <span className="absolute right-4 top-4 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Gratuit
            </span>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a8278]">
              Co-main · UFC Freedom 250
            </p>
            <div className="mt-4">
              <FighterMatchupLine
                red={freeFight.redCorner}
                blue={freeFight.blueCorner}
                variant="elegant"
              />
            </div>
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-4">
              <PredictionVerdictBanner fight={freeFight} variant="inline" showProbability />
            </div>
            <p className="mt-4 text-xs text-[#6b6b6b]">
              Confiance modèle : {formatPercent(freeFight.model.confidence)} — aperçu limité au
              co-main.
            </p>
          </article>

          {/* Premium — Topuria vs Gaethje (flouté) */}
          <article className="relative overflow-hidden rounded-2xl border border-[#c9b896]/30 bg-[#0f0e0c]">
            <span className="absolute right-4 top-4 z-20 rounded-full border border-[#c9b896]/40 bg-[#c9b896]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9b896]">
              Premium
            </span>

            <div className="relative p-6 blur-[4px] select-none" aria-hidden>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a8278]">
                Main event · {event.name}
              </p>
              <div className="mt-4">
                <FighterMatchupLine
                  red={premiumFight.redCorner}
                  blue={premiumFight.blueCorner}
                  variant="elegant"
                />
              </div>
              <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-4">
                <PredictionVerdictBanner fight={premiumFight} variant="inline" showProbability />
              </div>
              <div className="mt-5 rounded-lg bg-[#0c1219] px-3 py-3 text-center text-xs">
                Confiance {formatPercent(premiumFight.model.confidence)}
              </div>
            </div>

            <PremiumPreviewUnlock />
          </article>
        </div>
      </div>
    </section>
  )
}
