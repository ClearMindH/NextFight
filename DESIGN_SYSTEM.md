# NextFight — Design System

> **Référence absolue.** Ce document décrit l’état actuel du produit tel qu’implémenté.  
> Tout nouveau développement **doit réutiliser** ces tokens, espacements, typographies, animations et composants — **sans les modifier**.

---

## Règles impératives

| Interdit | Obligatoire |
|----------|-------------|
| Nouvelles couleurs hors palette | `background`, `foreground`, `gold`, `muted`, `card`, `border` |
| Nouvelles polices | `font-sans` (Inter), `font-display` (Geist Sans) |
| Animations plus longues / « bounce » excessif | Framer Motion 300–600 ms, easing `[0.22, 1, 0.36, 1]` |
| Style « site de paris » | Ton premium type Stripe / Linear / Vercel |
| Réinventer Navbar, cards, chips | Importer les composants existants |

Utilitaire de classes : `cn()` depuis `@/utils/cn` (clsx).

---

## Cartographie des pages

### Marketing (layout public)

| Route | Fichier | Composants / structure |
|-------|---------|------------------------|
| `/` | `app/page.tsx` | `Navbar` → `Hero` → `PlatformPreview` → `Statistics` → `Promotions` → `UpcomingEvents` → `FighterComparison` → `Pricing` → `Testimonials` → `FAQ` → `Footer` |
| `/legal` | `app/legal/page.tsx` | `Navbar` → contenu texte → `Footer` |
| `/ufc-predictions` | `app/ufc-predictions/page.tsx` | `OrgSeoPage` |
| `/pfl-predictions` | idem | `OrgSeoPage` |
| `/ksw-predictions` | idem | `OrgSeoPage` |
| `/ares-predictions` | idem | `OrgSeoPage` |
| `/hexagone-mma-predictions` | idem | `OrgSeoPage` |

**Ancres landing :** `#platform`, `#analytics`, `#events`, `#pricing`

### Dashboard (layout SaaS)

| Route | Fichier | Contenu |
|-------|---------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Overview : stat cards, liste events, reports, CTA gold |
| `/dashboard/predictions` | `app/dashboard/predictions/page.tsx` | `PredictionsClient` + `PredictionCard` |
| `/dashboard/events` | `app/dashboard/events/page.tsx` | Calendrier articles |
| `/dashboard/fighters` | `app/dashboard/fighters/page.tsx` | `FightersDatabase` + tableau |
| `/dashboard/premium` | `app/dashboard/premium/page.tsx` | Gestion plans |

**Layout dashboard :** `app/dashboard/layout.tsx` — `Sidebar` fixe `lg:w-64`, contenu `lg:pl-64`, padding `px-4 py-8 sm:px-6 lg:px-8 pt-16 lg:pt-8`.

### Racine

| Fichier | Rôle |
|---------|------|
| `app/layout.tsx` | Polices Inter + Geist, `body` `font-sans antialiased` |
| `app/globals.css` | Variables CSS + utilitaires `section-padding`, `container-content` |

---

## Tokens

### Couleurs

Définies dans `app/globals.css` (`:root`) et `tailwind.config.js` — **valeurs identiques**.

| Token Tailwind | Hex | Usage |
|----------------|-----|--------|
| `background` | `#050505` | Fond page, overlays hero |
| `foreground` | `#ffffff` | Texte principal, boutons primaires inversés |
| `gold` | `#c9a227` | Accent, labels, liens, barres de progression, états actifs |
| `muted` | `#8b8b8b` | Texte secondaire, icônes, bordures de graphiques |
| `card` | `#111111` | Surfaces cartes, sidebar, tooltips Recharts |
| `border` | `#1f1f1f` | Bordures, grilles, séparateurs |

**Dérivés autorisés (déjà utilisés — ne pas changer les opacités) :**

- `bg-background/80`, `bg-background/95`
- `bg-card/20`, `bg-card/30`, `bg-card/50`
- `bg-gold/5`, `bg-gold/10`, `bg-gold/15`
- `border-gold/30`, `border-gold/40`, `border-gold/50`
- `hover:shadow-gold/5`, `hover:shadow-gold/10`
- Gradient texte : `.text-gradient-gold` → `from-gold via-[#e8c547] to-gold`
- Gradient barre : `from-gold/80 to-gold`
- Barre secondaire charts : `#4a4a4a`

### Typographie

| Rôle | Classes | Police |
|------|---------|--------|
| Corps | `font-sans` (défaut body) | Inter (`--font-inter`) |
| Titres / brand | `font-display` | Geist Sans (`GeistSans.variable`) |

**Échelle typographique (patterns existants) :**

| Élément | Classes |
|---------|---------|
| Eyebrow / label section | `text-xs font-medium uppercase tracking-[0.2em] text-gold` |
| Eyebrow hero | `tracking-[0.25em]` |
| H1 hero | `font-display text-4xl … lg:text-7xl font-semibold leading-[1.1] tracking-tight` |
| H1 page / SEO | `font-display text-3xl sm:text-4xl font-semibold tracking-tight` |
| H2 section | `font-display text-2xl sm:text-3xl font-semibold tracking-tight` |
| H2 dashboard section | `font-display text-lg font-semibold` |
| H1 dashboard | `font-display text-2xl sm:text-3xl font-semibold tracking-tight` |
| Paragraphe lead | `text-base sm:text-lg text-muted leading-relaxed` |
| Paragraphe corps | `text-sm text-muted` |
| Micro label | `text-[10px] uppercase tracking-wider` |
| Chiffres stats | `font-display text-3xl sm:text-4xl font-semibold` |
| Prix | `font-display text-3xl font-semibold` |
| Logo mot | `font-display text-lg font-semibold tracking-tight` |
| Code inline | `text-xs text-gold` (dans hints dashboard) |

**Poids :** `font-medium`, `font-semibold`, `font-bold` (logo badge NF uniquement).

**Chiffres tabulaires :** `tabular-nums` (pourcentages, compteurs).

### Espacements & layout

**Utilitaires globaux (`globals.css`) :**

```css
.section-padding  → px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24
.container-content → mx-auto max-w-content w-full  /* max-width: 1280px */
```

**Grille conteneur interne (Navbar, Hero) :**  
`container-content` + `px-4 sm:px-6 lg:px-8` quand padding horizontal supplémentaire requis.

**Largeurs de contenu par contexte :**

| Contexte | Classe |
|----------|--------|
| Landing sections | `container-content` |
| FAQ | `container-content max-w-3xl` |
| SEO hero | `container-content max-w-3xl` |
| Dashboard overview | `max-w-5xl` |
| Dashboard fighters | `max-w-6xl` |
| Dashboard events / premium / predictions | `max-w-3xl` / `max-w-4xl` |
| Legal | `max-w-2xl` |

**Breakpoints (Tailwind par défaut + usage projet) :**

- `sm`: 640px — grilles 2 col, padding sections
- `md`: 768px — nav desktop, pricing 3 col
- `lg`: 1024px — sidebar dashboard, grilles 4 col stats, 2 col comparison
- `xl`: 1280px — aligné sur `max-w-content`

**Rayons de bordure :**

- Cartes / panels : `rounded-2xl`
- Boutons / chips : `rounded-full` ou `rounded-xl`
- Logo badge : `rounded-md`
- FAQ item : `rounded-xl`
- Barres progression : `rounded-full`

**Hauteurs récurrentes :**

- Navbar : `h-16`
- Sidebar desktop : `w-64`
- Charts : `h-64`, conteneur `min-h-[280px]`

---

## Composants

### `Navbar` — `components/Navbar.tsx`

**Type :** Client  
**Usage :** Toutes les pages marketing + SEO + legal

| État | Styles |
|------|--------|
| Top | `bg-transparent`, `fixed z-50` |
| Scroll (>24px) | `bg-background/95 border-b border-border backdrop-blur-md` |
| Transition | `transition-all duration-300` |

**Logo :** badge `h-8 w-8 rounded-md bg-gold text-background text-xs font-bold` + texte `font-display`.

**Liens desktop :** `text-sm text-muted hover:text-foreground` + underline animé `h-px bg-gold` `duration-300`.

**CTA primaire :** `rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-[1.02]`.

**CTA secondaire (login) :** texte muted sans fond.

**Mobile :** `AnimatePresence` + panneau `height` 0→auto, `duration: 0.3`, liens `rounded-lg px-3 py-2.5`.

---

### `Hero` — `components/Hero.tsx`

**Type :** Client  
**Structure :** Image plein écran → overlay `bg-background/80` → gradient `from-background via-background/40` → contenu centré.

**Animations entrée (Framer) :**

| Élément | delay | duration | y |
|---------|-------|----------|---|
| Eyebrow | 0 | 0.5 | 16 |
| H1 | 0.1 | 0.6 | 24 |
| Sous-titre | 0.2 | 0.6 | 24 |
| CTAs | 0.35 | 0.6 | 24 |
| Scroll hint | 1.0 | 0.6 | opacity |

**Boutons :**

- Primaire : `rounded-full bg-foreground px-6 py-3` + `hover:scale-[1.02] hover:shadow-lg hover:shadow-gold/10`
- Secondaire : `rounded-full border border-border bg-card/50 backdrop-blur hover:border-gold/40 hover:text-gold`

---

### `Footer` — `components/Footer.tsx`

**Type :** Server  
**Surface :** `border-t border-border bg-card/30` + `section-padding pb-8`.

**Grille :** `gap-10 sm:grid-cols-2 lg:grid-cols-4`.  
**Titres colonnes :** `text-xs font-semibold uppercase tracking-wider text-muted`.  
**Liens :** `text-sm text-muted hover:text-foreground`.  
**Social :** `hover:text-gold`.  
**Bas de page :** `border-t pt-8 text-xs text-muted`.

---

### `FadeIn` — `components/motion/FadeIn.tsx`

**Wrapper scroll-reveal standard** pour sections marketing.

```tsx
<FadeIn delay={0.08} duration={0.5} className="...">
```

| Prop | Défaut |
|------|--------|
| `delay` | `0` |
| `duration` | `0.5` |
| `viewport` | `once: true, margin: '-80px'` |
| `ease` | `[0.22, 1, 0.36, 1]` |
| Variants | `opacity 0→1`, `y 24→0` |

**Délais en cascade usuels :** `i * 0.06`, `i * 0.08`, `i * 0.1`.

---

### `AnimatedCounter` — `components/motion/AnimatedCounter.tsx`

**Usage :** `Statistics` — chiffres KPI.  
**Durée :** `1.2s`, easing cubic out.  
**Classes :** `tabular-nums` sur `motion.span`.

---

### `PredictionCard` — `components/PredictionCard.tsx`

**Type :** Client — carte signature du produit.

| Partie | Classes |
|--------|---------|
| Container | `rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20` |
| Hover | `whileHover={{ y: -4 }}` `duration: 0.3` |
| Label org | `text-xs font-medium uppercase tracking-wider text-gold` |
| % win | `text-lg font-semibold text-gold tabular-nums` |
| Barre | `h-1.5 rounded-full bg-border`, fill gradient gold |
| Métriques bas | `grid grid-cols-3`, labels `text-[10px] uppercase text-muted`, valeur highlight `text-gold` |

**Réutiliser pour :** previews, dashboard predictions, pages SEO.

---

### `PlatformPreview` — `components/PlatformPreview.tsx`

Section 2 colonnes `lg:grid-cols-2` + `PredictionCard` + eyebrow « Live model ».  
Bordures : `section-padding border-y border-border`.

---

### `Statistics` — `components/Statistics.tsx`

**Section :** `id="analytics"`, `border-y border-border bg-card/30`.  
**Grille :** `grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8`.  
**Carte KPI :** `rounded-2xl border border-border bg-card p-6 text-center`.

---

### `Promotions` — `components/Promotions.tsx`

Logos org en `font-display text-2xl sm:text-3xl font-bold text-muted/40 group-hover:text-foreground`.  
Hover : `motion.div whileHover={{ scale: 1.05 }}` `duration: 0.3`.

---

### `UpcomingEvents` — `components/UpcomingEvents.tsx`

**Section :** `id="events"`, `bg-card/20`.  
**Carte event :** `rounded-2xl border border-border bg-card p-5 hover:border-gold/30`.  
**Hover wrapper :** `y: -2`, `duration: 0.3`.  
**Badge org :** `text-xs font-semibold uppercase tracking-wider text-gold`.  
**Lien bas :** `text-sm text-gold hover:underline underline-offset-4`.  
**Icônes :** Lucide `Calendar`, `Users` size `12`.

---

### `FighterComparison` — `components/FighterComparison.tsx`

**Section :** `id="platform"`.  
**Cartes chart :** `rounded-2xl border border-border bg-card p-4 sm:p-6 min-h-[280px]`.  
**Tableau comparatif :** même bordure que ci-dessus, cellules gold pour corner « red ».

**Recharts (ne pas changer les couleurs) :**

| Élément | Valeur |
|---------|--------|
| Grid | `#1f1f1f` dash `3 3` |
| Axes | `#8b8b8b`, `fontSize` 10–11 |
| Tooltip | `background: #111`, `border: 1px solid #1f1f1f`, `borderRadius: 8` |
| Série primaire | `#c9a227`, `fillOpacity` 0.2 (radar) |
| Série secondaire | `#8b8b8b` / `#4a4a4a` (bar) |

---

### `Pricing` — `components/Pricing.tsx`

**Section :** `id="pricing"`, `border-t border-border`.  
**Grille :** `md:grid-cols-3 gap-6`.

| Variante | Classes |
|----------|---------|
| Carte standard | `border-border bg-card/50` |
| Carte highlighted | `border-gold/50 bg-card shadow-lg shadow-gold/5` |
| Badge | `rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold` |
| Check icon | `text-gold` size 16 |
| CTA highlighted | `bg-foreground text-background rounded-full hover:scale-[1.02]` |
| CTA outline | `border border-border hover:border-gold/40` |

---

### `Testimonials` — `components/Testimonials.tsx`

**Section :** `bg-card/20`.  
**Carte :** `rounded-2xl border border-border bg-card p-6 h-full`.  
**Étoiles :** `Star` `fill-gold text-gold` size 14.  
**Citation :** `text-sm leading-relaxed text-muted`.  
**Auteur :** séparateur `border-t border-border pt-4`.

---

### `FAQ` — `components/FAQ.tsx`

**Accordéon :** `rounded-xl border border-border bg-card`.  
**Bouton :** `px-5 py-4 text-sm font-medium`.  
**Chevron :** `rotate-180` quand ouvert, `duration-300`.  
**Panel :** `AnimatePresence`, height `0.3s`, réponse `text-sm text-muted leading-relaxed`.

---

### `OrgSeoPage` — `components/seo/OrgSeoPage.tsx`

Template pages SEO : `Navbar` + `main.pt-16` + hero texte + `PredictionCard` optionnel + `UpcomingEvents` + `Footer`.  
CTA : `rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background`.

---

### `Sidebar` — `components/dashboard/Sidebar.tsx`

**Type :** Client — navigation dashboard uniquement.

| Élément | Classes |
|---------|---------|
| Desktop aside | `lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card/30 lg:p-6` |
| Lien actif | `bg-gold/10 text-gold` |
| Lien inactif | `text-muted hover:bg-card hover:text-foreground` |
| Lien item | `rounded-lg px-3 py-2.5 text-sm gap-3` |
| Mobile trigger | `fixed top-4 left-4 z-50 rounded-lg border border-border bg-card p-2` |
| Overlay | `bg-background/80` |

**Icônes Lucide :** size `18` (nav), `20` (menu).

---

### `FightersDatabase` — `components/dashboard/FightersDatabase.tsx`

**Patterns dashboard réutilisables :**

- **Page header :** H1 display + `mt-2 text-muted text-sm`
- **Org summary cards :** `rounded-xl border p-3`, actif `border-gold/50 bg-gold/5`
- **FilterChip :** identique à `PredictionsClient` (voir ci-dessous)
- **Table :** `rounded-2xl border border-border`, header `bg-card`, `px-4 py-3`, hover row `hover:bg-card/50`
- **Accent org colonne :** `text-gold text-xs font-semibold`
- **Accent données clés :** `text-gold` (streak)

---

### `PredictionsClient` — `components/dashboard/PredictionsClient.tsx`

**FilterChip (pattern partagé dashboard + à copier tel quel) :**

```
rounded-full px-4 py-1.5 text-sm border transition-colors
actif:   border-gold bg-gold/10 text-gold
inactif: border-border text-muted hover:text-foreground
```

---

### Patterns dashboard (inline dans pages)

#### `StatCard` — `app/dashboard/page.tsx`

```
rounded-2xl border border-border bg-card p-5
Icon text-gold size 20
Valeur font-display text-2xl font-semibold
Label text-xs text-muted mt-1
```

#### Liste / article event — `app/dashboard/events/page.tsx`

```
rounded-2xl border border-border bg-card p-5 scroll-mt-24
Badge org: font-semibold text-gold uppercase text-xs
```

#### CTA gold dashboard

```
rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-background
```

#### Bouton primaire inversé (premium billing)

```
rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background
```

#### Carte plan sélectionné (premium)

```
border-gold bg-gold/5  vs  border-border bg-card hover:border-gold/30
```

---

## Boutons — récapitulatif

| Variant | Classes |
|---------|---------|
| **Primary inverse** | `rounded-full bg-foreground text-background font-medium hover:scale-[1.02]` |
| **Primary gold** | `rounded-full bg-gold text-background font-medium` |
| **Secondary outline** | `rounded-full border border-border bg-card/50 hover:border-gold/40 hover:text-gold` |
| **Ghost / link** | `text-sm text-muted hover:text-foreground` ou `text-gold hover:underline` |
| **Filter chip** | voir FilterChip |
| **Icon mobile** | `border border-border bg-card p-2 rounded-lg` |

---

## Cartes — récapitulatif

| Type | Classes de base |
|------|-----------------|
| **Standard** | `rounded-2xl border border-border bg-card` |
| **Semi-transparente** | `bg-card/50` ou `bg-card/20` section |
| **Highlighted** | `border-gold/50 shadow-lg shadow-gold/5` |
| **Padding** | `p-5` ou `p-6` |
| **Hover bordure** | `hover:border-gold/30` |

---

## Animations — récapitulatif

| Animation | Durée | Où |
|-----------|-------|-----|
| Navbar scroll / underline | `300ms` | Navbar |
| Hero fade-up | `0.5–0.6s` | Hero |
| FadeIn scroll | `0.5s` + delay | Sections landing |
| Card hover lift | `y: -4` ou `-2`, `0.3s` | PredictionCard, Pricing, Events |
| Scale hover | `1.05` ou `1.02` | Promotions, CTAs |
| Progress bar width | `0.6s` ease custom | PredictionCard |
| Counter | `1.2s` | Statistics |
| FAQ accordion | `0.3s` | FAQ |
| Mobile menu height | `0.3s` | Navbar |

**Courbe d’easing standard :** `[0.22, 1, 0.36, 1]` (FadeIn, barres).

---

## Icônes

**Bibliothèque :** `lucide-react` uniquement.

| Contexte | Taille |
|----------|--------|
| CTA flèche | 16 |
| Nav sidebar | 18 |
| Menu hamburger | 20–22 |
| Stat card | 20 |
| Meta event | 12 |
| Pricing check | 16 (landing), 12 (premium) |
| FAQ chevron | 18 |

**Couleur :** `text-gold` pour accent, `text-muted` pour neutre.

---

## Fichiers de référence

```
app/globals.css          → variables + utilitaires layout
tailwind.config.js       → tokens Tailwind
app/layout.tsx           → polices
components/Navbar.tsx
components/Hero.tsx
components/Footer.tsx
components/PredictionCard.tsx
components/motion/FadeIn.tsx
components/motion/AnimatedCounter.tsx
components/dashboard/Sidebar.tsx
utils/cn.ts
```

---

## Checklist nouveau développement

- [ ] Couleurs uniquement via tokens Tailwind documentés
- [ ] Titres en `font-display`, corps en `font-sans` (défaut)
- [ ] Sections marketing : `section-padding` + `container-content`
- [ ] Sections animées : wrapper `<FadeIn>` (pas d’animation custom longue)
- [ ] Cartes : `rounded-2xl border border-border bg-card`
- [ ] CTA principal : `rounded-full bg-foreground text-background`
- [ ] Accent / liens actifs : `text-gold`, bordures `border-gold/*`
- [ ] Dashboard : réutiliser `Sidebar` + patterns `FilterChip` / `StatCard` / table
- [ ] Données fight : réutiliser `PredictionCard`
- [ ] Graphiques : couleurs Recharts du `FighterComparison`
- [ ] Pas de style betting (pas de vert « cote », pas de rouge vif agressif)

---

*Document généré à partir de l’audit du codebase NextFight — ne pas altérer le design existant sans mise à jour explicite de ce fichier.*
