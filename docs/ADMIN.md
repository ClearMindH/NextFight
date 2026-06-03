# Panneau Admin — NextFight

## Accès

URL : `/admin`  
Login : `/admin/login`

Dans `.env.local` :

```bash
ADMIN_SECRET=votre-mot-de-passe-long-et-secret
```

Seuls les utilisateurs connaissant ce secret peuvent se connecter. Session cookie 12h.

## Fonctionnalités

| Onglet | Action |
|--------|--------|
| **Combattants** | Ajouter / modifier → `data/rosters/{org}.json` |
| **Événements** | Créer événement → `data/store/events.json` |
| **Combats** | Ajouter combat à un événement |
| **Prédictions** | Recalculer via `PredictionEngine` |
| **Abonnements** | Accorder Premium par email → `data/subscriptions.json` |

## Premium manuel (dev)

```bash
npm run grant:premium -- utilisateur@exemple.com
```

L’utilisateur se connecte sur `/login` avec cet email et le mot de passe `ADMIN_SECRET` (développement local uniquement).

## API (authentification requise)

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET|POST /api/admin/fighters`
- `PUT /api/admin/fighters/[id]`
- `GET|POST /api/admin/events`
- `POST /api/admin/fights`
- `POST /api/admin/recalculate`
- `GET|PATCH /api/admin/subscriptions`

## Sécurité

- Middleware protège `/admin/*` et `/api/admin/*`
- Ne jamais committer `ADMIN_SECRET`
- En production : HTTPS obligatoire, secret fort, envisager OAuth/SSO
