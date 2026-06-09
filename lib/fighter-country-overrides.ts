import type { Fighter } from '@/types'

/** Pays connus quand le roster UFC indique encore « Unknown ». */
const FIGHTER_COUNTRY_OVERRIDES: Record<string, string> = {
  'ufc-ilia-topuria': 'ESP',
  'ufc-justin-gaethje': 'USA',
  'ufc-alex-pereira': 'BRA',
  'ufc-ciryl-gane': 'FRA',
  'ufc-sean-omalley': 'USA',
  'ufc-aiemann-zahabi': 'CAN',
  'ufc-josh-hokit': 'USA',
  'ufc-mauricio-ruffy': 'BRA',
  'ufc-michael-chandler': 'USA',
  'ufc-bo-nickal': 'USA',
  'ufc-kyle-daukaus': 'USA',
  'ufc-diego-lopes': 'BRA',
  'ufc-steve-garcia': 'USA',
}

export function resolveFighterCountry(fighter: Pick<Fighter, 'id' | 'country'>): string | undefined {
  const override = FIGHTER_COUNTRY_OVERRIDES[fighter.id]
  if (override) return override

  const raw = fighter.country?.trim()
  if (!raw || raw === 'Unknown') return undefined
  return raw
}
