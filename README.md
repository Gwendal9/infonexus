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

## Structure du projet

```
infonexus/
├── app/                    # Routes Expo Router
├── components/             # Composants UI réutilisables
├── lib/
│   ├── queries/            # React Query hooks
│   ├── mutations/          # React Query mutations
│   └── validators/         # Schémas Zod
├── theme/                  # Design tokens (colors, spacing, typography)
├── types/                  # Types TypeScript
├── providers/              # React Context providers
└── docs/                   # Documentation projet
```

## Documentation

- [Project Context](docs/project-context.md) - Règles critiques pour les agents AI

## License

Private - All rights reserved
