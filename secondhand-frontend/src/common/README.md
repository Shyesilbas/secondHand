# Common & Shared Infrastructure UI Module

Core foundation for the frontend application: HTTP networking, authentication interceptors, design tokens, layout primitives, and shared UI components.

## Architecture

- **HTTP Client & API Layer (`services/api/`):**
  - `request.js`: Centralized Axios wrapper exporting typed HTTP verbs (`get`, `post`, `put`, `patch`, `del`).
  - `interceptors.js`: Handles automatic CSRF `X-XSRF-TOKEN` cookie extraction and coordinates queued silent 401 token refreshes (`/v1/auth/refresh`) to avoid duplicate rotation triggers.
  - `config.js`: Axios client instance configured with `withCredentials = true` and standard timeout settings.
- **Client Storage Security (`services/storage/`):**
  - `tokenStorage.js`: Sanitizes user objects before saving to `localStorage`. Explicitly removes passwords, tokens, API keys, and secret fields.
- **Shared UI Primitives (`components/ui/`):**
  - `Button`: Standardized button primitive utilizing `buttonClasses` variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) and explicit loading spinners.
  - `Modal`: Accessible dialog supporting focus trap, escape key dismissal, and backdrop overlays.
  - `Skeleton`: Composable placeholder components (`Skeleton`, `SkeletonCard`, `SkeletonList`, `SkeletonGrid`) for skeleton loading states.
  - `EmptyState`: Standardized empty data placeholder with title, description, and optional action button.
  - `Alert`: Semantic alert banner (`info`, `success`, `warning`, `error`).
  - `DataPagination`: Standardized pagination controls supporting Spring Boot zero-indexed page responses.
- **Layout System (`components/layout/`):**
  - `MainLayout`: Application shell containing `Header`, main content container, and `Footer`.
  - `AuthLayout`: Centered minimalist layout dedicated to authentication and password recovery screens.
  - `PageContainer`: Responsive maximum-width container enforcing consistent horizontal padding.
- **Core Hooks (`hooks/`):**
  - `useEnums`: Caches backend enum catalogs (`/v1/enums/all`) via React Query.
  - `useLocationOptions`: Dynamic city, district, and neighborhood cascading selector options.
  - `useDebouncedValue`: Debounces search and filter input changes.
  - `useWebSocket`: Manages STOMP WebSocket connection lifecycle and reconnection backoff.
- **Design Tokens & Constants (`constants/`):**
  - `theme.js`: Apple/Spotify-tier restrained design tokens (neutral surfaces, hairline borders, semantic status colors).
  - `apiEndpoints.js`: Master catalog of all REST and WebSocket backend routes.
  - `routes.js`: Frontend application route constants.

## Invariants

- **Zero Direct Axios Usage:** All API calls across feature modules must go through `request.js`; components and services never instantiate standalone Axios instances.
- **No In-Memory Token Leakage:** Raw JWT credentials are never stored in client-accessible storage (`localStorage` or `sessionStorage`); session tokens exist exclusively in `HttpOnly` cookies.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: `rounded-md` radius ceiling, semantic color variables, 4 data states (Loading, Empty, Error, Content), and zero decorative emojis.
