---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics]
inputDocuments:
  - planning-artifacts/prd.md
  - planning-artifacts/architecture.md
  - planning-artifacts/ux-design-specification.md
date: 2026-02-05
---

# InfoNexus - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for InfoNexus, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Source Management (FR1-FR7)**
- FR1: User can add a source by pasting a URL
- FR2: System can auto-detect source type from URL (RSS, HTML, YouTube)
- FR3: User can assign one or more themes to a source
- FR4: User can view the list of all configured sources
- FR5: User can remove a source from their configuration
- FR6: User can see the last successful fetch date for each source
- FR7: System can indicate when a source has failed to fetch (basic status)

**Content Aggregation (FR8-FR14)**
- FR8: System can fetch articles from RSS feeds
- FR9: System can scrape articles from HTML pages
- FR10: System can detect new videos from YouTube channels (via RSS)
- FR11: System can extract article summary (meta description or chapô)
- FR12: System can extract article image (og:image or first image)
- FR13: System can store fetched articles in the database
- FR14: User can trigger a manual refresh to fetch new articles

**Feed & Display (FR15-FR19)**
- FR15: User can view a scrollable feed of articles as visual cards
- FR16: User can see article title, summary, image, and source logo on each card
- FR17: User can tap a card to see full article details
- FR18: User can open the original article in an external browser
- FR19: User can pull-to-refresh the feed

**Thematic Organization (FR20-FR24)**
- FR20: User can create custom themes (e.g., Finance, Sport, Tech)
- FR21: User can view a dedicated dashboard for each theme
- FR22: User can navigate between themes via tabs/navigation
- FR23: User can filter the general feed by theme
- FR24: User can filter the general feed by source

**Article Interaction (FR25-FR27)**
- FR25: User can save an article to favorites
- FR26: User can view the list of saved favorites
- FR27: User can remove an article from favorites

**User Account (FR28-FR32)**
- FR28: User can create an account (email/password)
- FR29: User can log in to their account
- FR30: User can log out
- FR31: System can persist user's sources, themes, and favorites per account
- FR32: User can access their articles offline (cached locally)

**Data Sync (FR33-FR35)**
- FR33: System can sync user data between local cache and Supabase
- FR34: System can store articles locally for offline reading
- FR35: System can sync favorites to the cloud

### NonFunctional Requirements

**Performance**
- NFR1: Feed scroll fluide - 60 FPS sur device Android mid-range
- NFR2: Refresh manuel rapide - <10 secondes pour 5 sources
- NFR3: Démarrage app - <3 secondes cold start
- NFR4: Affichage feed - <1 seconde après ouverture (données cachées)

**Security**
- NFR5: Auth sécurisée via Supabase (email/password, tokens JWT)
- NFR6: Données transmises en HTTPS uniquement
- NFR7: Pas de stockage de credentials en clair sur le device
- NFR8: Isolation des données par user_id (multi-user ready)

**Reliability**
- NFR9: Taux de succès scraping - >90% des sources configurées
- NFR10: Gestion d'erreur gracieuse - App ne crash pas si une source échoue
- NFR11: Mode offline fonctionnel - Articles cachés lisibles sans connexion
- NFR12: Retry automatique - 3 tentatives avant marquage "échec"

**Integration**
- NFR13: Supabase SDK compatible avec Expo/React Native
- NFR14: Support des flux RSS standard (RSS 2.0, Atom)
- NFR15: Parsing HTML robuste (gestion des structures variées)
- NFR16: YouTube RSS feed compatible

### Additional Requirements

**From Architecture - Starter Template (CRITICAL for Epic 1)**
- Utiliser `npx create-expo-stack@latest infonexus --expo-router --supabase --stylesheet --no-git`
- Cette commande initialise le projet avec Expo Router + Supabase Auth préconfigurés

**From Architecture - Database & Backend**
- Database schema Supabase PostgreSQL avec RLS (tables: sources, themes, articles, favorites)
- Row Level Security policies pour isolation des données par user_id
- Edge Functions Supabase pour le scraping (scrape-sources, detect-source-type)
- Structure Edge Functions: `supabase/functions/` avec scrapers modulaires

**From Architecture - Frontend Stack**
- React Query (@tanstack/react-query) pour server state management
- expo-sqlite pour cache offline local
- Zod pour validation des données
- FlashList (@shopify/flash-list) pour feed scrollable haute performance
- expo-image pour images optimisées avec recycling

**From Architecture - Patterns**
- Naming: DB snake_case, TypeScript camelCase, Components PascalCase
- Tests co-localisés avec les composants (*.test.tsx)
- Queries centralisées dans lib/queries/, mutations dans lib/mutations/

**From UX Design**
- Design System "Warm & Clear" avec design tokens personnalisés
- Palette: primary #FF6B35, background #FAFAFA, surface #FFFFFF
- ArticleCard: image hero + titre + résumé + logo source
- StatusBadge: indicateurs vert/orange/rouge pour statut sources
- ThemeTabs: navigation horizontale entre dashboards thématiques
- Pull-to-refresh avec feedback visuel (animation + count articles)
- Touch targets minimum 44x44px (accessibilité WCAG)
- Cartes scanables en 1 seconde (hiérarchie visuelle claire)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | User can add a source by pasting a URL |
| FR2 | Epic 2 | System can auto-detect source type from URL |
| FR3 | Epic 2 | User can assign one or more themes to a source |
| FR4 | Epic 2 | User can view the list of all configured sources |
| FR5 | Epic 2 | User can remove a source from their configuration |
| FR6 | Epic 2 | User can see the last successful fetch date for each source |
| FR7 | Epic 2 | System can indicate when a source has failed to fetch |
| FR8 | Epic 3 | System can fetch articles from RSS feeds |
| FR9 | Epic 3 | System can scrape articles from HTML pages |
| FR10 | Epic 3 | System can detect new videos from YouTube channels |
| FR11 | Epic 3 | System can extract article summary |
| FR12 | Epic 3 | System can extract article image |
| FR13 | Epic 3 | System can store fetched articles in the database |
| FR14 | Epic 3 | User can trigger a manual refresh to fetch new articles |
| FR15 | Epic 4 | User can view a scrollable feed of articles as visual cards |
| FR16 | Epic 4 | User can see article title, summary, image, and source logo |
| FR17 | Epic 4 | User can tap a card to see full article details |
| FR18 | Epic 4 | User can open the original article in an external browser |
| FR19 | Epic 4 | User can pull-to-refresh the feed |
| FR20 | Epic 5 | User can create custom themes |
| FR21 | Epic 5 | User can view a dedicated dashboard for each theme |
| FR22 | Epic 5 | User can navigate between themes via tabs/navigation |
| FR23 | Epic 5 | User can filter the general feed by theme |
| FR24 | Epic 5 | User can filter the general feed by source |
| FR25 | Epic 6 | User can save an article to favorites |
| FR26 | Epic 6 | User can view the list of saved favorites |
| FR27 | Epic 6 | User can remove an article from favorites |
| FR28 | Epic 1 | User can create an account (email/password) |
| FR29 | Epic 1 | User can log in to their account |
| FR30 | Epic 1 | User can log out |
| FR31 | Epic 1 | System can persist user's sources, themes, and favorites per account |
| FR32 | Epic 7 | User can access their articles offline (cached locally) |
| FR33 | Epic 7 | System can sync user data between local cache and Supabase |
| FR34 | Epic 7 | System can store articles locally for offline reading |
| FR35 | Epic 7 | System can sync favorites to the cloud |

## Epic List

### Epic 1: Foundation & Authentication
L'utilisateur peut créer un compte, se connecter et accéder à l'app de manière sécurisée. Cet epic inclut l'initialisation du projet avec create-expo-stack et le setup complet de Supabase (schema, RLS).

**FRs covered:** FR28, FR29, FR30, FR31

---

### Epic 2: Source Management
L'utilisateur peut configurer ses sources d'information : ajout par URL avec détection automatique du type (RSS/HTML/YouTube), assignation de thèmes, et gestion via un dashboard dédié avec indicateurs de statut.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

---

### Epic 3: Content Aggregation
Le système récupère automatiquement les articles depuis les sources configurées via des Edge Functions Supabase. Support RSS, scraping HTML et YouTube RSS avec extraction de résumé et image.

**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14

---

### Epic 4: Feed & Article Display
L'utilisateur peut consulter son feed d'articles sous forme de cartes visuelles (image hero + titre + résumé + source), voir les détails d'un article et ouvrir l'original dans le navigateur.

**FRs covered:** FR15, FR16, FR17, FR18, FR19

---

### Epic 5: Thematic Organization
L'utilisateur peut créer des thèmes personnalisés, naviguer entre des dashboards thématiques via des tabs, et filtrer le feed général par thème ou par source.

**FRs covered:** FR20, FR21, FR22, FR23, FR24

---

### Epic 6: Favorites
L'utilisateur peut sauvegarder des articles en favoris pour les retrouver facilement, consulter sa liste de favoris et retirer des articles de cette liste.

**FRs covered:** FR25, FR26, FR27

---

### Epic 7: Offline & Sync
L'utilisateur peut lire ses articles même hors connexion grâce au cache local (expo-sqlite). Les données se synchronisent automatiquement avec Supabase quand la connexion est disponible.

**FRs covered:** FR32, FR33, FR34, FR35

---

## Epic 1: Foundation & Authentication

L'utilisateur peut créer un compte, se connecter et accéder à l'app de manière sécurisée. Cet epic inclut l'initialisation du projet avec create-expo-stack et le setup complet de Supabase (schema, RLS).

### Story 1.1: Project Initialization & Supabase Setup

As a **developer**,
I want **to initialize the InfoNexus project with the correct stack and database schema**,
So that **I have a solid foundation for building all features**.

**Acceptance Criteria:**

**Given** no project exists
**When** I run `npx create-expo-stack@latest infonexus --expo-router --supabase --stylesheet --no-git`
**Then** the project is created with Expo Router and Supabase Auth preconfigured
**And** the folder structure matches the architecture document

**Given** the project is initialized
**When** I create the Supabase project and run the initial migration
**Then** the following tables are created: `sources`, `themes`, `articles`, `favorites`
**And** Row Level Security is enabled on all tables
**And** RLS policies restrict access to `user_id = auth.uid()`

**Given** the database schema is deployed
**When** I configure environment variables (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
**Then** the app can connect to Supabase successfully

**Given** the project setup is complete
**When** I install additional dependencies (react-query, expo-sqlite, flash-list, expo-image, zod)
**Then** all packages are installed without conflicts

---

### Story 1.2: User Registration

As a **new user**,
I want **to create an account with my email and password**,
So that **I can access my personalized news feed**.

**Acceptance Criteria:**

**Given** I am on the registration screen
**When** I enter a valid email and password (min 6 characters)
**Then** my account is created in Supabase Auth
**And** I am automatically logged in
**And** I am redirected to the main feed

**Given** I am on the registration screen
**When** I enter an email that is already registered
**Then** I see an error message "Cet email est déjà utilisé"
**And** I remain on the registration screen

**Given** I am on the registration screen
**When** I enter an invalid email format
**Then** I see an error message "Email invalide"
**And** the submit button remains disabled

**Given** I am on the registration screen
**When** I enter a password shorter than 6 characters
**Then** I see an error message "Le mot de passe doit contenir au moins 6 caractères"

---

### Story 1.3: User Login

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my sources and articles**.

**Acceptance Criteria:**

**Given** I am on the login screen
**When** I enter valid credentials (email + password)
**Then** I am authenticated via Supabase Auth
**And** I receive a JWT token
**And** I am redirected to the main feed

**Given** I am on the login screen
**When** I enter incorrect credentials
**Then** I see an error message "Email ou mot de passe incorrect"
**And** I remain on the login screen

**Given** I am on the login screen
**When** I tap "Créer un compte"
**Then** I am navigated to the registration screen

---

### Story 1.4: User Logout & Session Persistence

As a **logged-in user**,
I want **to log out and have my session persist between app restarts**,
So that **I don't have to log in every time I open the app**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I tap the logout button in settings
**Then** my session is terminated
**And** I am redirected to the login screen
**And** my JWT token is cleared from secure storage

**Given** I was previously logged in and closed the app
**When** I reopen the app
**Then** my session is automatically restored
**And** I am taken directly to the main feed (not login screen)

**Given** my JWT token has expired
**When** I open the app
**Then** the token is automatically refreshed via Supabase
**And** I remain logged in seamlessly

**Given** I am not logged in
**When** I try to access any protected screen
**Then** I am redirected to the login screen
