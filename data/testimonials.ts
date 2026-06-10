export type Testimonial = {
  nom: string
  texte: string
  abonnement: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    nom: 'Thomas R.',
    texte:
      "J'utilise NextFight avant chaque carte UFC. Les probabilités sont vraiment basées sur des stats, pas sur l'opinion. Ça change tout.",
    abonnement: 'Premium mensuel',
  },
  {
    nom: 'Maxime D.',
    texte:
      "Le face-à-face statistique m'aide à vraiment comprendre chaque combat avant de le regarder. L'abonnement annuel vaut largement le prix.",
    abonnement: 'Premium annuel',
  },
  {
    nom: 'Karim B.',
    texte:
      "J'ai commencé avec le gratuit sur le co-main, j'ai vu la qualité et j'ai pris le Premium direct. Topuria vs Gaethje est déjà analysé en détail.",
    abonnement: 'Premium mensuel',
  },
]
