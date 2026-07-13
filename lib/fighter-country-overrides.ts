import type { Fighter } from '@/types'

/** Pays connus quand le roster UFC indique encore « Unknown » (stubs event-card). */
const FIGHTER_COUNTRY_OVERRIDES: Record<string, string> = {
  // UFC Freedom 250
  'ufc-ilia-topuria': 'ESP',
  'ufc-justin-gaethje': 'USA',
  'ufc-alex-pereira': 'BRA',
  'ufc-ciryl-gane': 'FRA',
  'ufc-sean-omalley': 'USA',
  'ufc-aiemann-zahabi': 'CAN',
  'ufc-josh-hokit': 'USA',
  'ufc-derrick-lewis': 'USA',
  'ufc-mauricio-ruffy': 'BRA',
  'ufc-michael-chandler': 'USA',
  'ufc-bo-nickal': 'USA',
  'ufc-kyle-daukaus': 'USA',
  'ufc-diego-lopes': 'BRA',
  'ufc-steve-garcia': 'USA',
  // UFC 329
  'ufc-conor-mcgregor': 'IRL',
  'ufc-max-holloway': 'USA',
  'ufc-benoit-saint-denis': 'FRA',
  'ufc-paddy-pimblett': 'UK',
  'ufc-cory-sandhagen': 'USA',
  'ufc-mario-bautista': 'USA',
  'ufc-brandon-royval': 'USA',
  'ufc-loneer-kavanagh': 'UK',
  'ufc-king-green': 'USA',
  'ufc-terrance-mckinney': 'USA',
  'ufc-nikita-krylov': 'RUS',
  'ufc-robert-whittaker': 'AUS',
  'ufc-gable-steveson': 'USA',
  'ufc-elisha-ellison': 'USA',
  'ufc-cody-garbrandt': 'USA',
  'ufc-adrian-yanez': 'USA',
  'ufc-riley-dutro': 'USA',
  'ufc-kai-kamaka-iii': 'USA',
  'ufc-tracy-cortez': 'USA',
  'ufc-wang-cong': 'CHN',
  'ufc-damian-pinas': 'MEX',
  'ufc-cesar-almeida': 'BRA',
  'ufc-farid-basharat': 'UK',
  'ufc-pablo-garza': 'USA',
  'ufc-ryan-gandra': 'USA',
  'ufc-zachary-reese': 'USA',
  'ufc-alessandro-costa': 'BRA',
  'ufc-cody-durden': 'USA',
  // UFC Fight Night Oklahoma City (18 juillet 2026)
  'ufc-dricus-du-plessis': 'ZAF',
  'ufc-kamaru-usman': 'NGA',
  'ufc-jared-cannonier': 'USA',
  'ufc-christian-leroy-duncan': 'UK',
  'ufc-chase-hooper': 'USA',
  'ufc-mitch-ramirez': 'USA',
  'ufc-tommy-mcmillen': 'USA',
  'ufc-alberto-montes': 'MEX',
  'ufc-tabatha-ricci': 'BRA',
  'ufc-fatima-kline': 'USA',
}

export function resolveFighterCountry(fighter: Pick<Fighter, 'id' | 'country'>): string | undefined {
  const override = FIGHTER_COUNTRY_OVERRIDES[fighter.id]
  if (override) return override

  const raw = fighter.country?.trim()
  if (!raw || raw === 'Unknown') return undefined
  return raw
}
