# InfoNexus

Agrégateur mobile de revue de presse personnalisée.

## Vision

Une app épurée qui agrège l'info depuis les sources choisies par l'utilisateur (RSS, journaux, YouTube) et la présente en cartes visuelles dans un feed scrollable + dashboards thématiques. Sans pub, sans algo, sans bruit.

## Stack technique

- **Mobile**: React Native 0.81 + Expo 54 + Expo Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Data fetching**: React Query
- **Offline**: expo-sqlite + sync queue
- **Animations**: React Native Reanimated + Gesture Handler
- **Validation**: Zod
- **Build**: EAS (APK Android)

## Getting Started

```bash
# Install dependencies
npm install

# Start development
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Configuration

1. Créer un projet sur [database.new](https://database.new)
2. Copier les clés API dans `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

### Build EAS

Les variables d'environnement Supabase sont configurées dans `eas.json` pour chaque profil de build.

```bash
# Build APK Android
eas build --platform android --profile preview
```

## Fonctionnalités

### Feed & Articles
- **Sources RSS / HTML / YouTube** — Ajout par URL ou catalogue (32+ sources pré-configurées), détection automatique du type
- **Feed scrollable** — Cartes visuelles avec titre, résumé, image, source, dates relatives et temps de lecture estimé
- **Articles sans image** — Barre d'accent colorée pour un feed visuellement rythmé
- **Thèmes** — Organisation des sources par thème, onglets dans le feed avec badges d'articles non lus
- **Sujets personnalisés** — Filtrage par mots-clés (titre/résumé), enrichi par GNews API. 100 sujets pré-configurés
- **Mode lecture** — Lecture in-app avec taille de police ajustable
- **Favoris & lecture** — Marquer articles comme lus/favoris, swipe gestures
- **Recherche globale** — Recherche en temps réel dans tous les articles
- **Scroll-to-top** — Bouton flottant pour remonter rapidement dans les listes

### Widgets (10)
| Widget | Source | Clé API |
|--------|--------|---------|
| Météo | Open-Meteo | Non |
| Crypto | CoinGecko | Non |
| Citation du jour | Base locale | Non |
| Football | API-Football | Non |
| Bourse | Finnhub | Oui (gratuite) |
| Actu | GNews | Oui (gratuite) |
| Mot du jour | Base locale | Non |
| GitHub Trending | GitHub API | Non |
| Aujourd'hui dans l'Histoire | Base locale | Non |
| Devises | Frankfurter (BCE) | Non |

### Technique
- **Offline first** — Articles cachés localement via SQLite, sync automatique au retour en ligne
- **Background refresh** — Rafraîchissement en arrière-plan des sources
- **Dark mode** — Thème clair, sombre ou système
- **Haptics** — Retour haptique sur les interactions
- **Onboarding** — Assistant 3 étapes (thèmes, sources, widgets)
- **Santé des sources** — Suivi du taux de succès et historique des fetches

## Structure du projet

```
infonexus/
├── app/                    # Routes Expo Router
│   ├── (auth)/             # Login, Register
│   ├── (tabs)/             # Feed, Sources, Favoris, Widgets, Réglages
│   └── article/[id].tsx    # Détail article + mode lecture
├── components/             # Composants UI
│   ├── widgets/            # 10 widgets (Weather, Crypto, Football, Stock,
│   │                       #   News, Word, Quote, GitHub, History, Currency)
│   ├── onboarding/         # Wizard d'onboarding
│   ├── ArticleCard.tsx     # Carte article (image/accent bar)
│   ├── ScrollToTopButton.tsx
│   └── ...
├── contexts/               # React Contexts
│   ├── ThemeContext.tsx     # Dark/light mode
│   ├── TopicContext.tsx     # Sujets personnalisés
│   ├── WidgetContext.tsx    # Configuration widgets
│   ├── NetworkContext.tsx   # Détection online/offline
│   └── ToastContext.tsx     # Notifications toast
├── lib/
│   ├── queries/            # React Query hooks
│   ├── mutations/          # React Query mutations
│   ├── topics/             # Types et 100 suggestions de sujets
│   ├── widgets/            # Types, presets et config widgets
│   ├── db/                 # SQLite (schema, operations)
│   ├── services/           # RSS parser, HTML scraper, article reader
│   └── sync/               # Sync Supabase <-> local
├── providers/              # AuthProvider, QueryProvider
├── theme/                  # Design tokens (colors, spacing, typography)
└── types/                  # Types TypeScript
```

## License

Private - All rights reserved
