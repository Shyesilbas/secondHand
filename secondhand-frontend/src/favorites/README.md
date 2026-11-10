# Favorites UI Module

Saved listings management, heart toggle buttons, and favorite status tracking.

## Architecture

- **`FavoritesPage`:** Grid view (`/favorites`) displaying all listings saved by the user with quick-remove actions.
- **`FavoriteButton`:** Reusable heart button with optimistic toggling placed on listing cards and detail heroes. Prompts unauthenticated guests to sign in via `useLoginPrompt`.
- **`useFavorites`:** React Query hook managing favorite states and mutations.
- **`favoriteService`:** API service executing `/v1/favorites` calls (`addFavorite`, `removeFavorite`, `getUserFavorites`, `checkIsFavorite`).

## Invariants

- **Optimistic Mutation:** Toggling a favorite updates local UI state immediately, rolling back on network or server failure.
- **Cache Invalidation:** Adding or removing a favorite invalidates `['favorites']`, listing cards' favorite status, and seller dashboard social metrics.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: subtle fill transitions, no bouncing celebration confetti or neon animations, and zero emojis.

