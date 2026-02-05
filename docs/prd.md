---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - planning-artifacts/product-brief-InfoNexus-2026-02-01.md
  - planning-artifacts/research/technical-infonexus-research-2026-02-01.md
  - analysis/brainstorming-session-2026-02-01.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: mobile_app
  domain: general
  complexity: low
  projectContext: greenfield
date: 2026-02-03
---

# Product Requirements Document - InfoNexus

**Author:** Gwen
**Date:** 2026-02-03

## Executive Summary

**Product:** InfoNexus — Agrégateur mobile de revue de presse personnalisée

**Vision:** Une app épurée qui agrège l'info depuis les sources choisies par l'utilisateur (RSS, journaux, YouTube) et la présente en cartes visuelles dans un feed scrollable + dashboards thématiques. Sans pub, sans algo, sans bruit.

**Différenciateur:** Anti-plateforme — récupérer la valeur des sources web sans le poison des réseaux sociaux. Contrôle total utilisateur, zéro algorithme d'enfermement.

**Utilisateur cible:** Consommateur d'info exigeant qui veut une vision claire de l'actu sans jongler entre 5 apps.

**Type projet:** Mobile app cross-platform (React Native + Expo), MVP personnel, Android prioritaire.

## Success Criteria

### User Success

- **Moment "aha!"** : Ouvrir l'app le matin et avoir une vision complète de l'actu en 5 minutes, sans bruit
- **Engagement actif** : 10-15 articles sauvegardés par semaine (preuve que l'info a de la valeur)
- **Remplacement effectif** : Plus besoin d'aller sur Google News, YouTube ou les sites individuels
- **Contrôle total** : L'utilisateur choisit ses sources, pas d'algo qui décide à sa place

### Business Success

| Phase | Objectif | Timeline |
|-------|----------|----------|
| V0-V1 | Usage personnel fiable au quotidien | MVP |
| V2 | Premiers utilisateurs externes (multi-user) | Post-MVP |
| V3 | Monétisation freemium | Vision |

### Technical Success

- **Qualité du scraping** : Articles complets et lisibles (pas de contenu tronqué ou mal formaté)
- **Fiabilité** : >90% des sources scrapées sans erreur
- **Fraîcheur** : Articles récupérés au moins 1x/jour (manuel puis automatique)

### Measurable Outcomes

| Métrique | Cible | Seuil d'échec |
|----------|-------|---------------|
| Articles sauvegardés | 10-15/semaine | <5/semaine |
| Sources actives | 5+ | <3 |
| Qualité scraping | Articles complets | Articles tronqués/illisibles |
| Taux de succès scraping | >90% | <70% |
| Ouvertures | 1+/jour | <3/semaine |

## Product Scope

### MVP - Minimum Viable Product

- Backend Supabase (PostgreSQL + Auth + Edge Functions)
- Scraping manuel (bouton refresh)
- Sources : RSS + scraping HTML basique + YouTube (RSS)
- Ajout de source par URL (détection automatique du type)
- Extraction meta/chapô pour résumés
- Feed vertical avec cartes basiques (titre + résumé + image + source)
- Dashboards thématiques par onglets
- Filtres par source ET par thème
- Favoris basiques
- Lien "lire l'original"
- Auth utilisateur (schéma multi-user ready)

### Growth Features (Post-MVP)

- Widgets spécialisés (score sport, graphique finance, chiffre du jour)
- Source health avec indicateurs visuels
- Issues automatiques pour debug Claude
- Recherche globale
- Instagram (scraping)
- Source health (indicateur visuel)
- Raspberry Pi + cron automatique

### Vision (Future)

- Rétrospective hebdo par thème
- Multi-utilisateurs actifs
- Rotation découverte (anti-bulle)
- Densité configurable (compact/magazine)
- Widgets avancés (storyline, versus, tendance)
- Résumé BART open source en fallback
- Freemium (sources limitées gratuites)

## User Journeys

### Journey 1 : Gwen — Premier lancement (Onboarding)

**Opening Scene :**
Gwen vient de télécharger InfoNexus. Elle a en tête 5-6 sources qu'elle veut suivre : Le Parisien, Hugo Décrypte (YouTube), un compte Instagram finance, un blog data/IA, et le flux RSS de L'Équipe.

**Rising Action :**
1. Elle ouvre l'app → écran d'accueil minimaliste "Ajoute ta première source"
2. Elle colle l'URL du Parisien → l'app détecte automatiquement le flux RSS
3. Elle ajoute Hugo Décrypte (YouTube) → l'app reconnaît la chaîne et propose de surveiller les nouvelles vidéos
4. Elle définit ses thèmes : Finance, Sport, Tech/IA, Actu générale
5. Elle assigne chaque source à un ou plusieurs thèmes

**Climax :**
Elle appuie sur "Refresh" → en quelques secondes, son feed se remplit de cartes visuelles provenant de SES sources. Pas de bruit, pas de pub. Juste l'info qu'elle a choisie.

**Resolution :**
Gwen a son agrégateur personnel configuré en 5 minutes. Elle sait exactement d'où vient chaque info. Elle contrôle tout.

**Capabilities révélées :** Ajout de source par URL, détection automatique du type (RSS/YouTube/HTML), assignation source→thème, refresh manuel, feedback visuel immédiat.

---

### Journey 2 : Gwen — Routine matin

**Opening Scene :**
7h30, Gwen prend son café. Elle ouvre InfoNexus comme chaque matin.

**Rising Action :**
1. Le feed s'affiche → cartes visuelles avec titre, résumé concis, image, logo source
2. Elle scrolle, scanne les titres — une actu politique l'intéresse
3. Elle tape sur la carte → détail avec résumé complet
4. Elle veut approfondir → bouton "Lire l'original" → ouvre Le Parisien dans le navigateur
5. Elle revient sur l'app, switch vers l'onglet "Finance"
6. Dashboard finance : CAC40, ses sources finance, infos du jour sur ce thème
7. Même chose pour "Sport" — les derniers résultats, articles de L'Équipe

**Climax :**
En 5-10 minutes, Gwen a une vision complète de l'actu générale + ses thèmes favoris. Aucune app externe ouverte.

**Resolution :**
Elle ferme l'app, informée et sereine. Elle a sauvegardé 2-3 articles intéressants pour plus tard. Mission accomplie.

**Capabilities révélées :** Feed scrollable, cartes visuelles, navigation par thème/onglet, lien vers source originale, sauvegarde favoris.

---

### Journey 3 : Gwen — Source cassée (Edge case)

**Opening Scene :**
Gwen ouvre l'app un matin. Elle remarque que Le Parisien n'a plus d'articles depuis 3 jours.

**Rising Action :**
1. Elle va dans "Mes sources" → tableau de bord des sources
2. Le Parisien a un indicateur rouge "Scraping échoué depuis 3 jours"
3. Elle tape sur la source → détail de l'erreur + une "issue" a été créée automatiquement
4. L'issue contient : date d'échec, message d'erreur, tentatives de retry
5. Plus tard, elle lance une session Claude Code pour debug
6. Claude lit l'issue, analyse le scraper, propose un fix

**Climax :**
Claude corrige le scraper (le site a changé sa structure HTML). Gwen déploie le fix.

**Resolution :**
Le lendemain, Le Parisien est de retour dans le feed. L'issue est fermée automatiquement après 3 scrapes réussis.

**Capabilities révélées :** Source health dashboard, indicateur visuel d'état, création automatique d'issues, stockage des erreurs pour debug, intégration workflow Claude.

---

### Journey 4 : Le Veilleur — Focus thématique unique

**Opening Scene :**
Marc ne s'intéresse qu'à la crypto. Il a configuré InfoNexus avec 4 sources crypto uniquement.

**Rising Action :**
1. Il ouvre l'app → va directement sur son dashboard "Crypto"
2. Toutes ses sources crypto en un seul endroit
3. Il scrolle les news du jour, sauvegarde un article sur un nouveau projet
4. Il ne touche jamais au feed général

**Climax :**
Marc a sa veille crypto quotidienne en 3 minutes, sans être pollué par l'actu générale.

**Resolution :**
InfoNexus est son outil de veille mono-thème. Simple, efficace, focalisé.

**Capabilities révélées :** Dashboard thématique indépendant, usage sans feed général, favoris par thème.

---

### Journey Requirements Summary

| Journey | Capabilities clés |
|---------|-------------------|
| Onboarding | Ajout source par URL, détection type auto, assignation thèmes, refresh manuel |
| Routine matin | Feed scrollable, cartes visuelles, navigation thèmes, lien original, favoris |
| Source cassée | Source health, indicateurs visuels, issues auto, stockage erreurs |
| Veilleur thématique | Dashboards indépendants, usage focalisé |

## Mobile App Specific Requirements

### Project-Type Overview

InfoNexus est une application mobile cross-platform développée avec React Native + Expo. Priorité Android pour le MVP, avec iOS comme bonus si le temps le permet. Distribution par APK direct (pas de store pour le MVP).

### Platform Requirements

| Aspect | Décision |
|--------|----------|
| **Framework** | React Native + Expo (SDK récent) |
| **Plateformes** | Android (prioritaire), iOS (si possible) |
| **Version Android min** | Android 10+ (API 29) — couvre ~95% des devices |
| **Version iOS min** | iOS 15+ (si iOS supporté) |
| **Distribution MVP** | APK direct (Android), TestFlight (iOS) |
| **Distribution future** | Play Store / App Store si succès |

### Offline Mode & Data

| Aspect | Approche |
|--------|----------|
| **Cache local** | expo-sqlite pour stocker les articles récupérés |
| **Sync** | Pull uniquement — refresh manuel déclenche le scraping |
| **Favoris** | Stockés localement + sync Supabase |
| **Données offline** | Articles déjà récupérés lisibles sans connexion |

### Device Permissions

| Permission | Usage | Obligatoire |
|------------|-------|-------------|
| **Internet** | Fetch articles, sync Supabase | Oui |
| **Storage** | Cache SQLite | Implicite |
| **Aucune autre** | Pas de caméra, GPS, contacts, etc. | — |

App minimaliste côté permissions = confiance utilisateur.

### Push Strategy

**Pas de push notifications pour le MVP.**

- Mode pull uniquement : l'utilisateur ouvre l'app et refresh manuellement
- Simplifie l'architecture (pas de Firebase Cloud Messaging)
- Peut être ajouté en V2 si besoin (notif nouvelle vidéo YouTube, breaking news)

### Store Compliance (Future)

Pour une publication future sur les stores :

| Store | Considérations |
|-------|----------------|
| **Play Store** | Privacy policy requise, déclaration des permissions, target SDK récent |
| **App Store** | Review plus stricte, besoin d'un compte Apple Developer ($99/an) |

**Pour le MVP** : APK signé distribué directement. Pas de contrainte store.

### Implementation Considerations

- **FlashList** (Shopify) pour le feed scrollable haute performance
- **expo-image** avec recyclingKey pour éviter le flickering
- **React Query** pour le data fetching et cache
- **Hermes** runtime activé par défaut (perf +40%)
- Build avec EAS Build (Expo Application Services) ou local

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche MVP :** Problem-solving MVP — résoudre le problème de l'info fragmentée dès le premier jour.

**Philosophie :** Le minimum qui fait que tu n'as plus besoin d'ouvrir Google News, YouTube ou les sites individuels le matin.

### MVP Feature Set (Phase 1)

**Core User Journeys Supportés :**
- ✅ Onboarding (ajout sources, thèmes)
- ✅ Routine matin (feed + dashboards thématiques)
- ⚠️ Source cassée (indicateur basique, pas d'issues auto)
- ✅ Veilleur thématique (dashboards)

**Must-Have Capabilities :**

| Capability | Description |
|------------|-------------|
| **Backend Supabase** | PostgreSQL + Auth + Edge Functions |
| **Scraping manuel** | Bouton refresh déclenche la récupération |
| **Sources RSS + HTML** | Détection auto du type par URL |
| **YouTube basique** | Détection nouvelles vidéos d'une chaîne |
| **Extraction résumé** | Meta description / chapô |
| **Feed vertical** | Cartes (titre + résumé + image + source) |
| **Dashboards thématiques** | Onglets par thème (filtre pré-configuré) |
| **Filtres** | Par source ET par thème |
| **Lien original** | Ouvrir l'article sur le site source |
| **Favoris basiques** | Sauvegarder un article |
| **Auth** | Compte utilisateur (schema multi-user ready) |

### Post-MVP Features

**Phase 2 (Growth) :**
- Widgets spécialisés (score sport, graphique finance)
- Source health avec indicateurs visuels
- Issues automatiques pour debug Claude
- Recherche globale dans les articles
- Instagram (scraping)
- Raspberry Pi + cron automatique

**Phase 3 (Vision) :**
- Rétrospective hebdo par thème
- Multi-utilisateurs actifs
- Rotation découverte (anti-bulle)
- Densité configurable (compact/magazine)
- Widgets avancés (storyline, versus, tendance)
- Résumé BART open source
- Freemium (sources limitées gratuites)

### Risk Mitigation Strategy

| Type | Risque | Mitigation |
|------|--------|------------|
| **Technique** | Scraping HTML fragile (sites changent) | RSS en priorité, HTML en fallback. Architecture modulaire par source. |
| **Technique** | YouTube API/scraping limité | Commencer avec RSS des chaînes YouTube (existe pour la plupart) |
| **Marché** | Personne d'autre n'en veut | MVP personnel d'abord — validation par usage réel |
| **Ressource** | Seul développeur | Scope lean, pas de features complexes, Supabase gère l'infra |

### Scope Boundaries

**Dans le MVP :**
- RSS, HTML basique, YouTube (RSS)
- Feed + Dashboards thématiques
- Favoris simples
- Refresh manuel

**Hors MVP (explicitement) :**
- Instagram (scraping complexe)
- Push notifications
- Source health avancé
- Recherche globale
- Cron automatique
- Widgets spécialisés

## Functional Requirements

### Source Management

- **FR1:** User can add a source by pasting a URL
- **FR2:** System can auto-detect source type from URL (RSS, HTML, YouTube)
- **FR3:** User can assign one or more themes to a source
- **FR4:** User can view the list of all configured sources
- **FR5:** User can remove a source from their configuration
- **FR6:** User can see the last successful fetch date for each source
- **FR7:** System can indicate when a source has failed to fetch (basic status)

### Content Aggregation

- **FR8:** System can fetch articles from RSS feeds
- **FR9:** System can scrape articles from HTML pages
- **FR10:** System can detect new videos from YouTube channels (via RSS)
- **FR11:** System can extract article summary (meta description or chapô)
- **FR12:** System can extract article image (og:image or first image)
- **FR13:** System can store fetched articles in the database
- **FR14:** User can trigger a manual refresh to fetch new articles

### Feed & Display

- **FR15:** User can view a scrollable feed of articles as visual cards
- **FR16:** User can see article title, summary, image, and source logo on each card
- **FR17:** User can tap a card to see full article details
- **FR18:** User can open the original article in an external browser
- **FR19:** User can pull-to-refresh the feed

### Thematic Organization

- **FR20:** User can create custom themes (e.g., Finance, Sport, Tech)
- **FR21:** User can view a dedicated dashboard for each theme
- **FR22:** User can navigate between themes via tabs/navigation
- **FR23:** User can filter the general feed by theme
- **FR24:** User can filter the general feed by source

### Article Interaction

- **FR25:** User can save an article to favorites
- **FR26:** User can view the list of saved favorites
- **FR27:** User can remove an article from favorites

### User Account

- **FR28:** User can create an account (email/password)
- **FR29:** User can log in to their account
- **FR30:** User can log out
- **FR31:** System can persist user's sources, themes, and favorites per account
- **FR32:** User can access their articles offline (cached locally)

### Data Sync

- **FR33:** System can sync user data between local cache and Supabase
- **FR34:** System can store articles locally for offline reading
- **FR35:** System can sync favorites to the cloud

## Non-Functional Requirements

### Performance

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR1** | Feed scroll fluide | 60 FPS sur device Android mid-range |
| **NFR2** | Refresh manuel rapide | <10 secondes pour 5 sources |
| **NFR3** | Démarrage app | <3 secondes cold start |
| **NFR4** | Affichage feed | <1 seconde après ouverture (données cachées) |

### Security

| NFR | Critère |
|-----|---------|
| **NFR5** | Auth sécurisée via Supabase (email/password, tokens JWT) |
| **NFR6** | Données transmises en HTTPS uniquement |
| **NFR7** | Pas de stockage de credentials en clair sur le device |
| **NFR8** | Isolation des données par user_id (multi-user ready) |

### Reliability

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR9** | Taux de succès scraping | >90% des sources configurées |
| **NFR10** | Gestion d'erreur gracieuse | App ne crash pas si une source échoue |
| **NFR11** | Mode offline fonctionnel | Articles cachés lisibles sans connexion |
| **NFR12** | Retry automatique | 3 tentatives avant marquage "échec" |

### Integration

| NFR | Critère |
|-----|---------|
| **NFR13** | Supabase SDK compatible avec Expo/React Native |
| **NFR14** | Support des flux RSS standard (RSS 2.0, Atom) |
| **NFR15** | Parsing HTML robuste (gestion des structures variées) |
| **NFR16** | YouTube RSS feed compatible |

