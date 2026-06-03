# Stripe — NextFight

## Offres

| Plan | Prix | ID interne |
|------|------|------------|
| Gratuit | 0€ | `free` |
| Premium Mensuel | 9,99€/mois | `premium_monthly` |
| Premium Annuel | 79,99€/an | `premium_annual` |

## Contenu Premium

- Toutes les prédictions
- Analyses détaillées par combat
- Historique
- Comparateur avancé

## Configuration

1. Créer un compte [Stripe Dashboard](https://dashboard.stripe.com)
2. Générer les prix :

```bash
STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
```

3. Copier les `price_...` dans `.env.local`
4. Configurer le webhook **POST** `https://votre-domaine/api/webhooks/stripe`

### Événements webhook

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

5. Local avec Stripe CLI :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copier le `whsec_...` dans `STRIPE_WEBHOOK_SECRET`.

## API

| Route | Méthode | Rôle |
|-------|---------|------|
| `/api/stripe/checkout` | POST | Crée une session Checkout |
| `/api/stripe/portal` | POST | Portail client facturation |
| `/api/stripe/verify-session` | GET | Après paiement + cookie |
| `/api/webhooks/stripe` | POST | Synchronise les abonnements |
| `/api/subscription/status` | GET | Statut Premium actuel |

## Stockage

En développement, les abonnements sont stockés dans `data/subscriptions.json` (gitignored).  
En production, remplacer par une base de données (PostgreSQL, Supabase, etc.).
