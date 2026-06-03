# Supabase — NextFight

Les **abonnements Premium** (Stripe) sont stockés dans **Supabase PostgreSQL**.  
Sans Supabase en production, les paiements ne restent pas fiables sur Vercel.

## 1. Créer le projet

1. [supabase.com](https://supabase.com) → **New project**
2. Notez :
   - **Project URL** → `SUPABASE_URL`
   - **Settings → API → service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`  
     Ne jamais exposer la service role au navigateur.

## 2. Créer la table

**SQL Editor** → coller le contenu de :

`supabase/migrations/001_subscriptions.sql`

→ **Run**.

## 3. Variables d’environnement

Dans `.env.local` (dev) et sur **Vercel / Railway** (prod) :

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

Avec Stripe et le site :

```env
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
ADMIN_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_ANNUAL=price_...
```

## 4. Vérifier

```bash
npm run grant:premium -- vous@email.com
```

Puis `/api/subscription/status` (connecté) ou admin → onglet Abonnements.

## 5. Déploiement recommandé

| Composant | Service |
|-----------|---------|
| Site Next.js | **Vercel** |
| Abonnements | **Supabase** |
| Paiements | **Stripe** |
| Code | **GitHub** (ClearMindH/NextFight) |

## Fallback local

Si `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont absents, le dev utilise encore `data/subscriptions.json`.

En production, configurez **toujours** Supabase.

## Migration depuis subscriptions.json

Si vous aviez des abonnements en local :

```bash
npm run migrate:subscriptions
```

(à lancer une fois avec Supabase configuré dans `.env.local`)
