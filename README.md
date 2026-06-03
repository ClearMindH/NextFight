# NextFight

**Pronostics MMA** — analyses statistiques et pages par promotion pour **UFC**, **PFL**, **KSW**, **ARES** et **Hexagone MMA**. Outil informatif, sans paris sportifs.

## Stack

- **Next.js 15** (App Router)
- **React 19** · **Tailwind CSS** · **Framer Motion**
- **Stripe** — abonnement Premium

## Getting started

Requires **Node.js ≥ 20**.

```bash
npm install
npm run dev
```

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Accueil — pronostics & calendrier |
| `/ufc-pronostics` … | Pronostics FR par promotion |
| `/ufc-predictions` … | Pronostics EN par promotion |
| `/fight/[id]` | Fiche combat + prédiction |
| `/pricing` | Offres Premium |
| `/account` | Abonnement Stripe |
| `/admin` | Back-office (voir `docs/ADMIN.md`) |

Les anciennes routes (`/dashboard`, `/events`, `/fighters`, etc.) redirigent vers l’accueil ou les pages pronostics.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm test` | Tests Vitest |
