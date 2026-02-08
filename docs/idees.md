# Idées - InfoNexus

## GNews comme source enrichie

GNews est une source particulièrement intéressante à creuser :

- **Personnalisation Google** : GNews s'appuie sur le compte Google de l'utilisateur, ce qui signifie que les résultats sont déjà pré-personnalisés selon ses centres d'intérêt et son historique.
- **Catégories multiples** : 6 catégories (Général, Business, Tech, Sport, Santé, Science) déjà intégrées.
- **Potentiel d'exploitation** :
  - Utiliser GNews comme source RSS alternative/complémentaire aux flux RSS classiques
  - Créer un onglet "Pour vous" basé sur les actus GNews personnalisées
  - Agréger les articles GNews dans le feed principal avec un badge "Tendance"
  - Recherche d'articles par mots-clés via l'endpoint `/search` de GNews
  - Suivi de sujets spécifiques (mots-clés récurrents)
  - Notifications push sur des sujets suivis
- **Limite** : 100 req/jour sur le tier gratuit - à optimiser avec du cache intelligent
- **API endpoints disponibles** :
  - `top-headlines` : actus du moment (déjà utilisé)
  - `search` : recherche par mots-clés (non exploité)

### Brainstorm à faire
- Comment mixer GNews + RSS dans un feed unifié ?
- UX de la personnalisation par intérêts
- Stratégie de cache pour rester dans les 100 req/jour
- Possibilité de passer au tier payant si l'usage décolle
