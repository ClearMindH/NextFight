# NextFight

**Pronostics UFC** — analyses statistiques carte par carte. Co-main gratuit, reste en Premium. Outil informatif, sans paris sportifs.

## Stack

- **Next.js 15** (App Router)
- **React 19** · **Tailwind CSS** · **Framer Motion**
- **Stripe** — abonnement Premium (4,99€/mois)

## Getting started

Requires **Node.js ≥ 20**.

```bash
npm install
npm run dev
```

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Accueil — carte UFC du week-end |
| `/ufc-pronostics` | Pronostics UFC (FR) |
| `/ufc-predictions` | Pronostics UFC (EN) |
| `/fight/[id]` | Fiche combat + prédiction |
| `/pricing` | Offre Premium 4,99€/mois |
| `/resultats` | Bilan pronostics UFC |
| `/account` | Abonnement Stripe |
| `/admin` | Back-office (voir `docs/ADMIN.md`) |

Les anciennes routes multi-promotions redirigent vers `/ufc-pronostics`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm test` | Tests Vitest |
| `npm run sync:events` | Sync cartes UFC depuis ufc.com |
