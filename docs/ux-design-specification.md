---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments:
  - planning-artifacts/prd.md
  - planning-artifacts/product-brief-InfoNexus-2026-02-01.md
date: 2026-02-03
author: Gwen
---

# UX Design Specification - InfoNexus

**Author:** Gwen
**Date:** 2026-02-03

---

## Executive Summary

### Project Vision

InfoNexus est un agrégateur mobile de revue de presse personnalisée. L'utilisateur choisit ses sources (RSS, YouTube, sites web), et l'app présente l'info en cartes visuelles épurées dans un feed scrollable + dashboards thématiques. Philosophie "anti-plateforme" : zéro pub, zéro algo, zéro bruit.

### Target Users

| Persona | Profil | Usage principal |
|---------|--------|-----------------|
| **Gwen** | Jeune actif multi-intérêts, a quitté Instagram | Feed général + dashboards thématiques |
| **Le Veilleur** | Focus sur 1-2 thèmes précis (crypto, sport...) | Dashboards uniquement |

### Key Design Challenges

| Défi | Impact |
|------|--------|
| **Onboarding fluide** | L'utilisateur doit configurer 5+ sources rapidement sans friction |
| **Cartes visuelles différenciantes** | Chaque carte doit être scannable en 1 seconde (titre, résumé, source) |
| **Navigation dual-mode** | Feed général ↔ Dashboards thématiques doit être naturel |
| **Feedback scraping** | L'utilisateur doit comprendre si le refresh fonctionne |
| **Minimalisme vs richesse** | Épuré mais pas vide — l'info doit être la star |

### Design Opportunities

| Opportunité | Comment se différencier |
|-------------|------------------------|
| **Cartes visuelles riches** | Chaque carte est un mini-univers visuel adapté au contenu |
| **Contrôle explicite** | L'utilisateur SAIT d'où vient chaque info (logo source visible) |
| **Absence de bruit** | Pas de pub, pas de suggestions, pas de social = expérience zen |
| **Navigation thématique** | Passer d'un thème à l'autre en un tap — mental model clair |

## Core User Experience

### Defining Experience

**Deux modes d'usage complémentaires :**

| Mode | Usage | Action principale |
|------|-------|-------------------|
| **Mode Config/Dev** | Gérer les sources, tester le scraping, debug | Dashboard sources avec statut temps réel |
| **Mode Consommateur** | Lire l'info, scroller, naviguer thèmes | Feed scrollable + refresh propre |

**Action critique #1 : Ajout de source**
- Coller une URL → l'app détecte le type → source ajoutée à la liste
- Doit être instantané et sans friction

**Action critique #2 : Dashboard sources**
- Voir la liste de toutes les sources configurées
- Statut de chaque source : en cours de test / OK / échec
- Quand tu reviens sur le code, tu sais exactement où en est chaque scraper

### Platform Strategy

| Aspect | Décision |
|--------|----------|
| **Plateforme** | Mobile app (React Native + Expo) |
| **Input** | Touch-based (tap, scroll, pull-to-refresh) |
| **Priorité** | Android (APK direct) |
| **Offline** | Articles cachés lisibles sans connexion |

### Effortless Interactions

| Interaction | Doit être "magique" |
|-------------|---------------------|
| **Ajout source** | Coller URL → done (détection auto du type) |
| **Refresh** | Pull-to-refresh naturel, feedback visuel clair |
| **Navigation thèmes** | Un tap = changement de dashboard |
| **Statut scraping** | Visible d'un coup d'œil (pastille couleur) |

### Critical Success Moments

| Moment | Ce qui doit se passer |
|--------|----------------------|
| **Premier ajout de source** | URL collée → source détectée → feedback immédiat |
| **Premier refresh** | Feed se remplit avec SES articles — "ça marche !" |
| **Retour après coding** | Dashboard sources montre l'état de chaque scraper |
| **Routine matin** | 5 min pour avoir une vision complète de l'actu |

### Experience Principles

1. **Contrôle explicite** — L'utilisateur sait toujours ce qui se passe (statut visible, pas de magie cachée)
2. **Zéro friction config** — Ajouter une source = 1 action (coller URL)
3. **Feedback immédiat** — Chaque action a une réponse visuelle claire
4. **Info > Interface** — L'info est la star, l'interface s'efface

## Desired Emotional Response

### Primary Emotional Goals

| Émotion | Description | Moment clé |
|---------|-------------|------------|
| **Sérénité** | "Enfin une app qui ne me stresse pas" | Scroll du feed sans pub ni notification |
| **Contrôle** | "Je sais exactement ce qui se passe" | Dashboard sources avec statuts visibles |
| **Efficacité** | "5 minutes et j'ai ma vision complète" | Routine du matin terminée |
| **Confiance** | "Je sais d'où vient chaque info" | Logo source visible sur chaque carte |

### Emotional Journey Mapping

| Phase | Émotion visée | Anti-pattern à éviter |
|-------|---------------|----------------------|
| **Onboarding** | Curiosité → Satisfaction rapide | Frustration (config trop longue) |
| **Ajout source** | "Ça marche !" instantané | Confusion (statut unclear) |
| **Refresh** | Anticipation → Récompense | Anxiété (refresh qui échoue silencieusement) |
| **Mode Dev** | Maîtrise, clarté | Stress (ne pas savoir ce qui casse) |
| **Retour quotidien** | Routine confortable | Lassitude (même chose répétitive) |

### Micro-Emotions

| Micro-émotion | Importance pour InfoNexus |
|---------------|---------------------------|
| **Confiance vs Confusion** | CRITIQUE — l'utilisateur doit toujours savoir où en est le scraping |
| **Accomplissement vs Frustration** | HAUTE — chaque refresh réussi = petite victoire |
| **Calme vs Anxiété** | HAUTE — différenciateur vs réseaux sociaux |
| **Satisfaction vs Déception** | MOYENNE — qualité des articles récupérés |

### Design Implications

| Émotion visée | Décision UX |
|---------------|-------------|
| **Sérénité** | Pas de compteurs de notifications, pas de badges rouges urgents |
| **Contrôle** | Pastilles de statut explicites (vert/orange/rouge) sur chaque source |
| **Efficacité** | Cartes scanables en 1 seconde (titre + résumé visible immédiatement) |
| **Confiance** | Logo source toujours visible, jamais d'info "magique" sans origine |
| **Accomplissement** | Feedback visuel clair au refresh (animation subtile, count d'articles) |

### Emotional Design Principles

1. **Transparence radicale** — Chaque action a un feedback visible. Pas de magie cachée.
2. **Zéro urgence artificielle** — Pas de notifications push, pas de FOMO, pas de "X nouveaux articles !"
3. **Calme par design** — Interface épurée, l'info est la star, pas les décorations
4. **Victoires fréquentes** — Chaque refresh réussi, chaque source qui marche = micro-récompense
5. **Honnêteté des erreurs** — Quand ça casse, c'est visible et clair, pas caché

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

| App | Ce qu'elle fait bien | Pattern clé pour InfoNexus |
|-----|---------------------|---------------------------|
| **Vinted** | Cartes produits claires (image + prix + marque), grille scannable | Cards avec hiérarchie visuelle immédiate |
| **Notion** | Interface minimale, le contenu est la star, pas de distraction | "Info > Interface" — l'UI s'efface |
| **Hevy** | Dashboards de progression clairs, data visualisée simplement | Dashboard sources avec statuts visuels |
| **Deliveroo** | Suivi de commande en temps réel (statut visible), couleurs chaudes | Feedback statut scraping (en cours/OK/échec) |
| **Airbnb** | Images hero, cartes accueillantes, indicateurs de confiance | Cartes visuelles avec logo source = confiance |

**Thème commun identifié :** Clarté + chaleur des couleurs

### Transferable UX Patterns

**Navigation Patterns**
| Pattern | Source | Application InfoNexus |
|---------|--------|----------------------|
| Tabs horizontaux | Airbnb, Deliveroo | Navigation entre dashboards thématiques |
| Pull-to-refresh | Toutes | Refresh du feed |
| Grille de cartes | Vinted, Airbnb | Feed d'articles |

**Interaction Patterns**
| Pattern | Source | Application InfoNexus |
|---------|--------|----------------------|
| Statut en temps réel | Deliveroo (suivi commande) | Statut scraping sur dashboard sources |
| Pastilles de statut | Hevy (séries complétées) | Indicateurs vert/orange/rouge par source |
| Tap pour détail | Toutes | Carte → article complet |

**Visual Patterns**
| Pattern | Source | Application InfoNexus |
|---------|--------|----------------------|
| Couleurs chaudes | Airbnb, Deliveroo | Palette accueillante, pas froide/corporate |
| Espacement généreux | Notion, Airbnb | Cartes aérées, pas de surcharge |
| Images hero | Airbnb, Vinted | Image article en vedette sur chaque carte |
| Typographie claire | Notion | Titres lisibles, hiérarchie évidente |

### Anti-Patterns to Avoid

| Anti-pattern | Pourquoi l'éviter | Apps qui le font (mal) |
|--------------|-------------------|------------------------|
| Notifications push agressives | Contraire à la philosophie "calme" | La plupart des apps d'actu |
| Feed algorithmique opaque | L'utilisateur doit garder le contrôle | Instagram, TikTok |
| Pub entre les cartes | Casse l'expérience de lecture | Google News, Flipboard |
| Social features (likes, commentaires) | Ajoute du bruit, pas de valeur | Twitter/X |
| Badges "X nouveaux articles !" | Crée de l'anxiété artificielle | Apps d'actu classiques |
| Animations excessives | Ralentit, distrait | — |

### Design Inspiration Strategy

**À adopter directement :**
- Cartes avec image hero + titre + source (style Airbnb/Vinted)
- Palette chaude et accueillante (pas de bleu froid corporate)
- Statut temps réel visible (style Deliveroo)
- Espacement généreux (style Notion)

**À adapter :**
- Grille Vinted → adapter en liste verticale pour le feed (mieux pour la lecture)
- Dashboard Hevy → simplifier pour statut sources (vert/orange/rouge)

**À éviter absolument :**
- Tout ce qui ressemble à un réseau social
- Tout ce qui crée de l'urgence artificielle
- Tout ce qui cache l'origine de l'info

## Design System Foundation

### Design System Choice

**Approche : Custom Minimal**

| Aspect | Décision |
|--------|----------|
| **Framework** | React Native StyleSheet natif |
| **Philosophie** | Composants maison, légers et contrôlés |
| **Dépendances** | Aucune librairie UI externe |
| **Theming** | Design tokens centralisés |

### Rationale for Selection

| Critère | Pourquoi Custom Minimal |
|---------|------------------------|
| **Contrôle visuel** | 100% contrôle sur l'esthétique "chaude et claire" |
| **Légèreté** | Pas de bloat, bundle minimal |
| **Apprentissage** | Patterns React Native natifs, pas de syntaxe à apprendre |
| **Anti-générique** | Évite le look Material/Google trop reconnaissable |
| **Évolutivité** | Peut ajouter une librairie plus tard si besoin |

### Implementation Approach

**Structure recommandée :**
```
src/
  theme/
    colors.ts       # Palette de couleurs
    spacing.ts      # Espacement (4, 8, 12, 16, 24...)
    typography.ts   # Tailles de police, fonts
    shadows.ts      # Ombres pour les cartes
  components/
    Card/           # Carte article
    Button/         # Boutons
    StatusBadge/    # Pastilles vert/orange/rouge
    TabBar/         # Navigation dashboards
```

### Design Tokens

**Palette de couleurs (chaude et accueillante) :**

| Token | Usage | Valeur indicative |
|-------|-------|-------------------|
| `primary` | Actions principales, accents | Orange chaud (#FF6B35) |
| `background` | Fond de l'app | Blanc cassé (#FAFAFA) |
| `surface` | Cartes, éléments surélevés | Blanc (#FFFFFF) |
| `text.primary` | Titres | Gris très foncé (#1A1A1A) |
| `text.secondary` | Résumés, meta | Gris moyen (#6B6B6B) |
| `status.ok` | Source OK | Vert (#34C759) |
| `status.warning` | Source en cours | Orange (#FF9500) |
| `status.error` | Source en échec | Rouge (#FF3B30) |

**Espacement (base 4px) :**

| Token | Valeur |
|-------|--------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |

**Typographie :**

| Token | Usage | Taille |
|-------|-------|--------|
| `title.lg` | Titre de carte | 18px, bold |
| `title.md` | Sous-titre | 16px, semibold |
| `body` | Résumé article | 14px, regular |
| `caption` | Source, date | 12px, regular |

### Customization Strategy

| Besoin | Stratégie |
|--------|-----------|
| **Cartes articles** | Composant `<ArticleCard>` avec props (title, summary, image, source) |
| **Statuts sources** | Composant `<StatusBadge status="ok|warning|error">` |
| **Navigation thèmes** | Composant `<ThemeTabs>` avec tabs horizontaux |
| **Pull-to-refresh** | React Native natif `RefreshControl` |

## Defining Core Experience

### The Defining Interaction

**"Mon journal perso en 5 minutes"**

| Aspect | Description |
|--------|-------------|
| **Pitch** | Ouvrir l'app → scroller → avoir une vision complète de l'actu sur MES sources |
| **Feeling** | "J'ai fait ma revue de presse, je suis informé, sans stress" |
| **Comparaison** | Comme feuilleter un journal papier personnalisé chaque matin |

### User Mental Model

| Ce que l'utilisateur pense | Comment InfoNexus répond |
|---------------------------|-------------------------|
| "Je veux MES sources, pas ce qu'un algo me pousse" | Sources 100% choisies, zéro suggestion |
| "Je veux voir vite si quelque chose d'important s'est passé" | Cartes scanables en 1 seconde |
| "Je veux pouvoir approfondir si ça m'intéresse" | Tap → article complet / lien source |
| "Je veux naviguer par thème quand j'ai le temps" | Dashboards thématiques par onglets |

**Solutions actuelles et leurs problèmes :**

| Solution actuelle | Problème | InfoNexus résout |
|-------------------|----------|-----------------|
| Google News | Trop générique, pas mes sources | Sources choisies uniquement |
| Instagram/X | Pub, algo, social noise | Zéro bruit |
| Sites individuels | Fragmenté, 10 onglets | Tout au même endroit |
| Feedly/RSS readers | Mur de texte, pas visuel | Cartes visuelles riches |

### Success Criteria

| Critère | Indicateur de succès |
|---------|---------------------|
| **Rapidité** | Feed chargé en < 2 secondes |
| **Clarté** | Chaque carte comprise en 1 seconde (titre + source visible) |
| **Complétude** | "J'ai vu tout ce qui m'intéresse" en 5 min |
| **Confiance** | Je sais d'où vient chaque info (logo source) |
| **Contrôle** | Aucune info que je n'ai pas demandée |

### Pattern Analysis

**Patterns établis utilisés :**

| Pattern | Origine | Usage InfoNexus |
|---------|---------|-----------------|
| Feed scrollable vertical | Instagram, Twitter | Feed principal d'articles |
| Pull-to-refresh | iOS standard | Actualiser le feed |
| Tabs horizontaux | Toutes les apps | Navigation entre dashboards thématiques |
| Cartes avec image | Airbnb, Vinted | Présentation des articles |

**Innovation InfoNexus :**

| Innovation | Description |
|------------|-------------|
| **Transparence source** | Chaque carte montre explicitement la source (logo + nom) |
| **Dual-mode** | Feed général + Dashboards thématiques dans une seule app |
| **Dashboard sources (Mode Dev)** | Voir l'état de chaque scraper en temps réel |

### Experience Mechanics

**Flow principal : Routine du matin**

```
1. INITIATION
   └─ Ouvrir l'app → Feed général affiché immédiatement

2. INTERACTION
   ├─ Scroll vertical → Parcourir les cartes
   ├─ Tap carte → Voir article complet
   ├─ Tap "Lire source" → Ouvrir l'original dans browser
   └─ Tap onglet thème → Changer de dashboard

3. FEEDBACK
   ├─ Pull-to-refresh → Animation + "X nouveaux articles"
   ├─ Carte lue → Indicateur visuel subtil (opacité réduite ?)
   └─ Fin du feed → Message "Tu es à jour"

4. COMPLETION
   └─ L'utilisateur ferme l'app, informé et serein
```

**Flow secondaire : Mode Dev (gestion sources)**

```
1. INITIATION
   └─ Aller dans Settings → Dashboard sources

2. INTERACTION
   ├─ Voir liste des sources avec statut (🟢🟠🔴)
   ├─ Tap source → Détails (dernière sync, erreur éventuelle)
   └─ Bouton "+" → Ajouter source (coller URL)

3. FEEDBACK
   ├─ Ajout source → Détection auto type → Statut "en test"
   ├─ Test réussi → Pastille verte
   └─ Test échoué → Pastille rouge + message d'erreur

4. COMPLETION
   └─ Toutes les sources sont vertes → Ready to scrape
```

## Visual Design Foundation

### Color System

**Palette principale — "Warm & Clear"**

| Rôle | Token | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | `primary` | #FF6B35 | Boutons, accents, actions |
| **Primary Light** | `primary.light` | #FF8F66 | Hover, backgrounds légers |
| **Background** | `background` | #FAFAFA | Fond principal de l'app |
| **Surface** | `surface` | #FFFFFF | Cartes, modals, éléments surélevés |
| **Text Primary** | `text.primary` | #1A1A1A | Titres, texte important |
| **Text Secondary** | `text.secondary` | #6B6B6B | Résumés, meta, captions |
| **Text Muted** | `text.muted` | #9B9B9B | Placeholders, texte désactivé |
| **Border** | `border` | #E5E5E5 | Séparateurs, contours subtils |

**Couleurs sémantiques (statuts)**

| Rôle | Token | Hex | Usage |
|------|-------|-----|-------|
| **Success** | `status.ok` | #34C759 | Source OK, action réussie |
| **Warning** | `status.warning` | #FF9500 | Source en test, attention |
| **Error** | `status.error` | #FF3B30 | Source en échec, erreur |
| **Info** | `status.info` | #007AFF | Information neutre |

**Rationale :**
- Orange chaud (#FF6B35) : chaleur, énergie, différenciation vs bleu corporate
- Fond blanc cassé (#FAFAFA) : doux pour les yeux, pas agressif
- Pas de bleu dominant : évite le look "Google/Facebook"

### Typography System

**Fonts**

| Plateforme | Font principale | Fallback |
|------------|-----------------|----------|
| iOS | SF Pro Text | System |
| Android | Roboto | System |

→ Utiliser les fonts système pour performance et cohérence native.

**Type Scale**

| Token | Taille | Weight | Line Height | Usage |
|-------|--------|--------|-------------|-------|
| `display` | 24px | Bold (700) | 1.2 | Titres de section |
| `title.lg` | 18px | SemiBold (600) | 1.3 | Titre de carte |
| `title.md` | 16px | SemiBold (600) | 1.3 | Sous-titres |
| `body` | 14px | Regular (400) | 1.5 | Résumé article, texte courant |
| `caption` | 12px | Regular (400) | 1.4 | Source, date, meta |
| `small` | 10px | Medium (500) | 1.3 | Badges, labels |

**Rationale :**
- Hiérarchie claire : titre scannable en 1 seconde
- Line height généreux (1.5 pour body) : lisibilité
- Pas de fonts fancy : clarté > originalité

### Spacing & Layout Foundation

**Spacing Scale (base 4px)**

| Token | Valeur | Usage |
|-------|--------|-------|
| `xxs` | 2px | Micro-ajustements |
| `xs` | 4px | Entre éléments très proches |
| `sm` | 8px | Padding interne compact |
| `md` | 16px | Padding standard, gaps |
| `lg` | 24px | Séparation entre sections |
| `xl` | 32px | Marges principales |
| `xxl` | 48px | Grands espaces, headers |

**Layout Principles**

| Principe | Application |
|----------|-------------|
| **Marges écran** | 16px (md) sur les côtés |
| **Gap entre cartes** | 12px vertical |
| **Padding carte** | 16px interne |
| **Border radius** | 12px pour les cartes (arrondi doux) |

**Card Layout**

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │                             │ │ ← Image hero (ratio 16:9)
│ │         IMAGE               │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ TITRE DE L'ARTICLE              │ ← title.lg, max 2 lignes
│                                 │
│ Résumé de l'article qui peut    │ ← body, max 3 lignes
│ tenir sur plusieurs lignes...   │
│                                 │
│ 🔵 Source Name  •  il y a 2h    │ ← caption + logo source
└─────────────────────────────────┘
```

### Accessibility Considerations

| Aspect | Exigence | Implémentation |
|--------|----------|----------------|
| **Contraste texte** | WCAG AA (4.5:1 minimum) | Text primary sur background = 12:1 ✓ |
| **Contraste boutons** | WCAG AA | Primary sur white = 4.6:1 ✓ |
| **Touch targets** | 44x44px minimum | Boutons et zones tap ≥ 44px |
| **Couleurs seules** | Pas d'info uniquement par couleur | Statuts : couleur + icône/texte |
| **Taille texte min** | 12px minimum | Caption = 12px ✓ |
| **Focus states** | Visible pour navigation clavier | Border 2px primary sur focus |

## Design Direction Decision

### Design Direction Chosen

**"Warm & Clear" — Content-First Card Interface**

| Dimension | Décision |
|-----------|----------|
| **Style** | Moderne, chaleureux, épuré (inspiré Airbnb/Notion) |
| **Layout** | Feed vertical de cartes full-width |
| **Densité** | Aérée — respiration entre les éléments |
| **Interaction** | Touch-native, gestures standards iOS/Android |
| **Navigation** | Bottom tabs + top tabs thématiques |

### Design Rationale

| Choix | Pourquoi |
|-------|----------|
| **Cartes full-width** | Maximise l'image hero, scannable rapidement |
| **Espacement généreux** | Sensation de calme, anti-surcharge |
| **Couleurs chaudes** | Différenciation vs apps froides/corporate |
| **Fonts système** | Performance + cohérence native |
| **Border radius 12px** | Douceur visuelle, moderne sans être excessif |

### Key Visual Decisions

**Feed principal :**
```
┌────────────────────────────────────┐
│  ≡  InfoNexus           🔄  ⚙️    │ ← Header avec refresh + settings
├────────────────────────────────────┤
│  Général │ Finance │ Sport │ Tech │ ← Tabs thématiques
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │        IMAGE HERO              │ │
│ └────────────────────────────────┘ │
│ Titre de l'article sur deux       │
│ lignes maximum                     │
│                                    │
│ Résumé concis de l'article...     │
│                                    │
│ 🔵 Le Monde  •  il y a 2h         │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │        IMAGE HERO              │ │
│ └────────────────────────────────┘ │
│ ...                                │
└────────────────────────────────────┘
```

**Dashboard sources (Mode Dev) :**
```
┌────────────────────────────────────┐
│  ←  Mes Sources              ＋   │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ 🟢  Le Monde                   │ │
│ │     RSS • Dernière sync: 10min │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🟠  Hugo Décrypte              │ │
│ │     YouTube • En cours...      │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🔴  TechCrunch                 │ │
│ │     HTML • Erreur: timeout     │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Implementation Approach

| Composant | Implémentation |
|-----------|----------------|
| **ArticleCard** | View + Image + Text hierarchy + TouchableOpacity |
| **ThemeTabs** | ScrollView horizontal avec état actif |
| **SourceCard** | View + StatusBadge + meta info |
| **StatusBadge** | View circulaire avec couleur sémantique |
| **RefreshControl** | React Native natif avec couleur primary |

