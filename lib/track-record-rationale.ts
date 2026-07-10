type FightRationale = {
  predictionWhy: string
  resultWhy: string
}

const RATIONALE_BY_FIGHT: Record<string, FightRationale> = {
  'ufc-fight-night-june-06-2026-f1': {
    predictionWhy:
      'Bonfim arrive avec une progression nette, un grappling plus menaçant et un profil qui vieillissait mieux que Muhammad sur la durée.',
    resultWhy:
      'Bonfim a neutralisé les séries au sol et tenu la distance quand il le fallait — son contrôle et sa constance ont fait la différence aux points.',
  },
  'ufc-fight-night-june-06-2026-f2': {
    predictionWhy:
      'Allen combine volume, cardio et polyvalence — Shahbazyan reste dangereux mais moins fiable sur trois rounds complets.',
    resultWhy:
      'Allen a imposé son rythme et survécu aux moments chauds — profil plus complet confirmé à la décision.',
  },
  'ufc-fight-night-june-06-2026-f3': {
    predictionWhy:
      'Ziam partait avec l\'expérience UFC, la gestion de distance et un grappling défensif solide face à Nolan.',
    resultWhy:
      'Nolan a poussé le tempo et imposé sa pression — Ziam n\'a pas réussi à garder le contrôle du rythme sur la durée.',
  },
  'ufc-fight-night-june-06-2026-f4': {
    predictionWhy:
      'Luna montait en puissance avec un volume et une agressivité qui devaient tester le grappling de Mitchell.',
    resultWhy:
      'Mitchell a imposé son jeu au sol dès les phases critiques — le contrôle et la menace de soumission ont basculé le combat.',
  },
  'ufc-fight-night-june-06-2026-f5': {
    predictionWhy:
      'Baraniewski combine puissance, agressivité et un profil physique qui devait dominer Tafua en début de combat.',
    resultWhy:
      'Baraniewski a frappé tôt et imposé son intensité — le KO au premier round valide la lecture power vs expérience.',
  },
  'ufc-fight-night-june-06-2026-f6': {
    predictionWhy:
      'Costa arrive plus jeune, plus athlétique et avec un profil de finisseur supérieur à Schnell sur la forme récente.',
    resultWhy:
      'Costa a touché tôt avec sa puissance — Schnell n\'a pas tenu la montée en volume adverse.',
  },
  'ufc-fight-night-june-06-2026-f7': {
    predictionWhy:
      'Yannis partait avec la dynamique et la forme récente face à un McGhee plus expérimenté mais moins en confiance.',
    resultWhy:
      'McGhee a imposé son expérience et sa gestion de distance — Yannis n\'a pas su imposer son rythme sur trois rounds.',
  },
  'ufc-fight-night-june-06-2026-f8': {
    predictionWhy:
      'Chairez combine menace de soumission et finitions rapides — profil qui devait punir Silva en début de combat.',
    resultWhy:
      'Chairez a trouvé la soumission rapidement — la menace au sol a été le facteur décisif comme anticipé.',
  },
  'ufc-fight-night-june-06-2026-f9': {
    predictionWhy:
      'Cachoeira partait avec le volume et l\'agressivité sur la forme récente face à Chandler.',
    resultWhy:
      'Chandler a imposé son grappling et conclu au sol — la menace de soumission a renversé notre lecture striking.',
  },
  'ufc-fight-night-june-06-2026-f10': {
    predictionWhy:
      'Leavitt combine wrestling et contrôle — profil qui devait limiter les phases debout de Brito.',
    resultWhy:
      'Brito a touché tôt avec sa soumission — Leavitt n\'a pas réussi à imposer son contrôle au sol.',
  },
  'ufc-fight-night-june-06-2026-f11': {
    predictionWhy:
      'Combat serré — Chaves partait avec un léger edge sur la forme récente et la gestion de distance.',
    resultWhy:
      'Chaves a tenu la distance et remporté un combat proche — la lecture « léger favori » s\'est confirmée.',
  },
  'ufc-fight-night-june-06-2026-f12': {
    predictionWhy:
      'Souza combine puissance et finitions — profil qui devait punir Carnelossi en début de combat.',
    resultWhy:
      'Souza a frappé tôt et conclu par KO — la menace de power au premier round a validé le pronostic.',
  },
  'ufc-freedom-250-f1': {
    predictionWhy:
      'Topuria impose pression, précision et constance — Gaethje a le power mais devait tenir sur la distance face à un champion invaincu qui monte en volume.',
    resultWhy:
      'Gaethje a résisté au volume, touché au corps et forcé l\'arrêt du coin de Topuria — upsets majeur sur la durée malgré notre favori champion.',
  },
  'ufc-freedom-250-f2': {
    predictionWhy:
      'Gane gagne sur la mobilité et la gestion à distance — Pereira doit toucher pour imposer son power, plus difficile sur 5 rounds.',
    resultWhy:
      'Gane a géré la distance puis frappé en volume au second round — la lecture mobilité vs power s\'est confirmée.',
  },
  'ufc-freedom-250-f3': {
    predictionWhy:
      "O'Malley conserve l'avantage en boxe, reach et gestion de distance malgré la dynamique récente de Zahabi.",
    resultWhy:
      "O'Malley a imposé sa boxe et conclu au second round — reach et timing ont fait la différence.",
  },
  'ufc-freedom-250-f4': {
    predictionWhy:
      "Hokit arrive avec la dynamique et l'athlétisme pour dicter le rythme — Lewis a l'expérience mais le profil récent du prospect basculait le matchup.",
    resultWhy:
      'Hokit a imposé son tempo et frappé en séries — la dynamique et la forme récente ont dominé.',
  },
  'ufc-freedom-250-f5': {
    predictionWhy:
      'Ruffy combine volume, portée et taux de finish — Chandler reste dangereux mais le tempo et la forme récente du Brésilien faisaient la différence.',
    resultWhy:
      'Ruffy a enchaîné hauts coups et strikes au sol pour finir tôt — profil de finisseur confirmé.',
  },
  'ufc-freedom-250-f6': {
    predictionWhy:
      'Nickal domine la lutte et le contrôle des transitions — Daukaus part avec de la forme mais le niveau au sol basculait le matchup.',
    resultWhy:
      'Nickal a imposé son striking au sol et conclu au premier round — domination confirmée.',
  },
  'ufc-freedom-250-f7': {
    predictionWhy:
      'Lopes impose son grappling et a affronté une opposition plus relevée — Garcia part fort sur la forme récente mais le profil global favorisait Lopes.',
    resultWhy:
      'Lopes a trouvé le KO au second round — la menace de finition et le niveau d\'opposition ont payé.',
  },
}

const DEFAULT_CORRECT: FightRationale = {
  predictionWhy: 'Notre modèle et la lecture matchup pointaient vers le vainqueur pronostiqué.',
  resultWhy: 'Le profil du vainqueur a imposé son jeu — la lecture du matchup s\'est confirmée.',
}

const DEFAULT_INCORRECT: FightRationale = {
  predictionWhy: 'Notre modèle favorisait le profil statistique du combattant pronostiqué.',
  resultWhy:
    'L\'adversaire a imposé un facteur clé (rythme, grappling ou power) que le modèle avait sous-estimé.',
}

export function getTrackRecordRationale(fightId: string, correct: boolean): FightRationale {
  const curated = RATIONALE_BY_FIGHT[fightId]
  if (curated) return curated
  return correct ? DEFAULT_CORRECT : DEFAULT_INCORRECT
}
