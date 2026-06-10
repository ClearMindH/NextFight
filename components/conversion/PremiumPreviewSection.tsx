import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PremiumPreviewUnlock } from '@/components/conversion/PremiumPreviewUnlock'
import { getFightPageData } from '@/lib/fights'
import { fighterShortName } from '@/lib/prediction-verdict'

const FREE_FIGHT_ID = 'ufc-freedom-250-f2'
const PREMIUM_FIGHT_ID = 'ufc-freedom-250-f1'

export function PremiumPreviewSection() {
  const freeData = getFightPageData(FREE_FIGHT_ID)
  const premiumData = getFightPageData(PREMIUM_FIGHT_ID)

  if (!freeData || !premiumData) return null

  const { fight: freeFight } = freeData
  const { fight: premiumFight, event } = premiumData
  const otherPremiumFights = event.fights.length - 2
  const redProb = Math.round(freeFight.model.redWinProbability)
  const blueProb = 100 - redProb

  return (
    <section className="border-t border-[#1a1816]">
      <div className="container-content section-padding">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
            Aperçu du contenu Premium
          </h2>
          <p className="mt-3 text-sm text-[#8a8278]">
            Comparez ce que vous voyez gratuitement et ce que Premium débloque sur UFC Freedom 250.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
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
            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 px-4 py-4 text-sm tabular-nums">
              <span className="text-[#f5f2eb]">
                {fighterShortName(freeFight.redCorner.name)}{' '}
                <span className="font-semibold text-emerald-300">{redProb}%</span>
              </span>
              <span className="text-muted">/</span>
              <span className="text-[#f5f2eb]">
                <span className="font-semibold text-emerald-300">{blueProb}%</span>{' '}
                {fighterShortName(freeFight.blueCorner.name)}
              </span>
            </div>
            <p className="mt-4 text-xs text-[#8a8278]">Disponible sans compte</p>
          </article>

          <article className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[#c9b896]/30 bg-[#0f0e0c]">
            <span className="absolute right-4 top-4 z-20 rounded-full border border-[#c9b896]/40 bg-[#c9b896]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9b896]">
              Premium
            </span>

            <div className="relative p-6 blur-[6px] select-none" aria-hidden>
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
              <div className="mt-5 flex justify-between rounded-xl border border-white/[0.06] bg-black/30 px-4 py-4 text-sm">
                <span>Topuria 68%</span>
                <span>Gaethje 32%</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-[#0c1219] py-3 text-center">Analyse détaillée</div>
                <div className="rounded-lg bg-[#0c1219] py-3 text-center">Face-à-face stats</div>
              </div>
            </div>

            <PremiumPreviewUnlock otherFightsCount={Math.max(otherPremiumFights, 0)} />
          </article>
        </div>
      </div>
    </section>
  )
}
