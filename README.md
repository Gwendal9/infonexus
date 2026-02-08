# InfoNexus

Agrégateur mobile de revue de presse personnalisée.

## Vision

Une app épurée qui agrège l'info depuis les sources choisies par l'utilisateur (RSS, journaux, YouTube) et la présente en cartes visuelles dans un feed scrollable + dashboards thématiques. Sans pub, sans algo, sans bruit.

## Stack technique

- **Mobile**: React Native + Expo + Expo Router
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Data fetching**: React Query
- **Feed**: FlashList (Shopify)
- **Offline**: expo-sqlite
- **Validation**: Zod

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

## Configuration Supabase

1. Créer un projet sur [database.new](https://database.new)
2. Copier les clés API dans `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## Fonctionnalités

- **Sources RSS / HTML / YouTube** — Ajout par URL, détection automatique du type
- **Feed scrollable** — Cartes visuelles avec titre, résumé, image, source
- **Thèmes** — Organisation des sources par thème, onglets dans le feed
- **Sujets personnalisés** — Filtrage par mots-clés sur le contenu (titre/résumé), enrichi par GNews API. 100 sujets pré-configurés avec mots-clés suggérés
- **Widgets** — Météo, Crypto, Football, Bourse, Actu (GNews), Mot du jour, Citation
- **Favoris & lecture** — Marquer articles comme lus/favoris
- **Offline** — Articles cachés localement via SQLite
- **Recherche** — Recherche globale dans les articles

## Structure du projet

```
infonexus/
├── app/                    # Routes Expo Router
│   ├── (tabs)/             # Feed, Sources, Favoris, Widgets, Settings
│   └── article/[id].tsx    # Détail article
├── components/             # Composants UI réutilisables
│   ├── widgets/            # Widgets (Weather, Crypto, Football, Stock, News, Word, Quote)
│   ├── AddTopicModal.tsx   # Création/édition de sujets
│   ├── TopicArticleList.tsx # Liste articles filtrés par sujet
│   └── ...
├── contexts/               # React Contexts
│   ├── TopicContext.tsx     # Sujets personnalisés (AsyncStorage)
│   ├── WidgetContext.tsx    # Configuration widgets (AsyncStorage)
│   └── ...
├── lib/
│   ├── queries/            # React Query hooks
│   ├── mutations/          # React Query mutations
│   ├── topics/             # Types et suggestions de sujets (100 groupes × 5-10 mots-clés)
│   ├── widgets/            # Types et données widgets
│   ├── db/                 # SQLite (schema, operations)
│   └── sync/               # Sync Supabase ↔ local
├── theme/                  # Design tokens (colors, spacing, typography, palette)
├── types/                  # Types TypeScript
├── providers/              # React Context providers
└── docs/                   # Documentation projet
```

## Documentation

- [Project Context](docs/project-context.md) - Règles critiques pour les agents AI

## License

Private - All rights reserved
