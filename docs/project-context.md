---
project_name: 'InfoNexus'
user_name: 'Gwen'
date: '2026-02-04'
sections_completed: ['technology_stack', 'implementation_rules', 'anti_patterns', 'edge_functions', 'testing', 'workflow']
status: 'complete'
rule_count: 35
optimized_for_llm: true
---

# Project Context for AI Agents — InfoNexus

_Règles critiques que les agents AI doivent suivre. Focus sur les détails non-évidents._

---

## Technology Stack & Versions

| Technology | Usage |
|------------|-------|
| **React Native + Expo** | Mobile app cross-platform |
| **Expo Router** | File-based navigation |
| **TypeScript** | Strict mode |
| **Supabase** | PostgreSQL + Auth + Edge Functions |
| **React Query** | Data fetching et cache |
| **FlashList** | Feed scrollable haute performance |
| **expo-image** | Images optimisées avec recycling |
| **expo-sqlite** | Cache offline |
| **Zod** | Validation des données |

---

## Critical Implementation Rules

### Supabase Integration

- **TOUJOURS** utiliser les types générés par Supabase CLI (`types/database.ts`)
- **JAMAIS** de types manuels pour les tables DB
- Déstructurer `{ data, error }` sur chaque appel Supabase
- `throw error` dans les queryFn pour que React Query gère l'erreur
- RLS activé sur toutes les tables — filtrage automatique par `user_id`

### React Query Patterns

- **OBLIGATOIRE** pour tout data fetching — pas de `useEffect` + `fetch`
- Hooks dans `lib/queries/` : `useArticles`, `useSources`, `useThemes`, etc.
- Mutations dans `lib/mutations/` : `useAddSource`, `useRefreshSources`, etc.
- Invalidation après mutation : `queryClient.invalidateQueries(['key'])`
- `isLoading` pour chargement initial, `isFetching` pour refresh

### Component Patterns

- Composants UI dans `components/` — **pas de data fetching dans les composants**
- Data fetching uniquement via hooks React Query
- Props pour passer les données, pas de fetch interne
- Skeleton components pour les états de chargement

### Naming Conventions

| Contexte | Convention | Exemple |
|----------|------------|---------|
| Tables DB | snake_case pluriel | `sources`, `articles` |
| Colonnes DB | snake_case | `user_id`, `created_at` |
| Components | PascalCase | `ArticleCard.tsx` |
| Hooks | camelCase use* | `useArticles.ts` |
| Functions | camelCase | `fetchSources` |
| Variables | camelCase | `articleList` |

### File Organization

- Tests co-localisés : `ArticleCard.test.tsx` à côté de `ArticleCard.tsx`
- Exports via `index.ts` dans chaque dossier
- Routes dans `app/` (Expo Router)
- Composants réutilisables dans `components/`
- Logique métier dans `lib/`

### Error Handling

- React Query gère les erreurs server — `throw` dans queryFn
- UI : composant `<ErrorMessage>` réutilisable
- Scraping : update `sources.status` et `sources.last_error`, pas de throw global
- 3 retries avant marquage erreur

### Topics (Sujets personnalisés)

- **Pattern AsyncStorage** identique aux widgets : `TopicContext` + `useState` + `useEffect` load + `saveConfig`
- Sujets filtrent par **contenu** (mots-clés sur titre/résumé) — différent des thèmes qui groupent des sources
- Données : `lib/topics/types.ts` (Topic, TopicsConfig, GNewsSearchArticle)
- Suggestions : `lib/topics/suggestions.ts` — 100 groupes × 5-10 mots-clés français
- Hook `useTopicArticles(topicId)` — combine SQLite local (`LIKE` sur title/summary) + GNews `/search` API
- Cache GNews 1h par sujet dans AsyncStorage, budget 80 req/jour (20 réservées widget Actu)
- Articles GNews → `Linking.openURL()`, articles RSS → `router.push('/article/[id]')`

### Design System

- **StyleSheet natif** — pas de librairie CSS-in-JS
- Design tokens dans `theme/` : `colors.ts`, `spacing.ts`, `typography.ts`, `palette.ts`
- Palette "Warm & Clear" : primary #FF6B35, background #FAFAFA
- **24 couleurs partagées** dans `theme/palette.ts` — utilisées par thèmes et sujets
- Espacement base 4px (xs=4, sm=8, md=16, lg=24, xl=32)

---

## Anti-Patterns à éviter

- ❌ `useEffect` + `useState` pour fetch data → utiliser React Query
- ❌ Types manuels pour DB → utiliser types Supabase générés
- ❌ Data fetching dans composants → hooks dans `lib/queries/`
- ❌ `console.log(error)` → throw pour React Query
- ❌ Fichiers `article-card.tsx` → `ArticleCard.tsx` (PascalCase)
- ❌ CSS inline répétitif → design tokens dans `theme/`
- ❌ Credentials en clair → variables d'environnement

---

## Edge Functions (Scraping)

- Scraping dans `supabase/functions/scrape-sources/`
- Détection type URL dans `supabase/functions/detect-source-type/`
- Scrapers modulaires dans `_shared/scrapers/` : `rss.ts`, `html.ts`, `youtube.ts`
- Chaque source scrape indépendamment — une erreur n'affecte pas les autres
- Update status dans DB, pas de throw global

---

## Testing Rules

- Tests co-localisés avec les composants
- Mock React Query avec `@tanstack/react-query` testing utilities
- Mock Supabase client pour tests unitaires
- Pas de tests E2E pour MVP

---

## Git & Workflow

- Branches : `feature/nom-feature`, `fix/nom-fix`
- Commits : messages clairs en anglais ou français
- Pas de push --force sur main
