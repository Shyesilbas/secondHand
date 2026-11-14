# Common & Shared Infrastructure UI Module

Core foundation for the frontend application: HTTP networking, authentication interceptors, design tokens, route guards, layout primitives, and shared UI components.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`core`](../../../src/main/java/com/serhat/secondhand/core/README.md)
> - **Architecture Deep Dive:** [`docs/error-handling-and-contract-architecture.md`](../../../docs/error-handling-and-contract-architecture.md)
> - **Architecture Deep Dive:** [`docs/frontend-architecture-and-state-management.md`](../../../docs/frontend-architecture-and-state-management.md)

## 1. Overview & Purpose
Cross-cutting frontend infrastructure: the Axios client (`request.js`, `config.js`, `interceptors.js` with CSRF and silent 401 refresh), route guards, layouts (`MainLayout`, `AuthLayout`, `PageContainer`), UI primitives (`Button`, `Modal`, `Alert`, `Skeleton`, `EmptyState`, `DataPagination`) and shared hooks (`useDebouncedValue`, `useWebSocket`, `useEnums`, `useClickOutside`).

## 2. Route Map & Entry Points

All routes live in `common/routes/AppRoutes.jsx` with paths from `common/constants/routes.js` (`ROUTES`). Each module README lists its own routes.

| Guard / Layout | Behavior |
|---|---|
| `ProtectedRoute` | Guests get the login prompt (`useLoginPrompt`); cancelling navigates to `/`. |
| `PublicRoute` | Authenticated users are redirected to `location.state.from` or `/`. |
| `AdminRoute` | Guests go to `/login` (with `state.from`); non-admin users (`isAdminUser`) go to `/`. |
| `MainLayout` / `AuthLayout` | App shell for feature pages / auth screens (login, register, OAuth callbacks, forgot password). |

## 3. Component Rules

- **Zero Direct Axios Usage:** All application API requests must pass through `request.js`. Feature modules never import Axios directly.
- **Searchable pages:** `constants/appPages.js` indexes nested pages (campaigns, coupons, complaints). Header search matches by label and keywords above listing results.
- **No Token Storage in LocalStorage:** Raw JWT credentials exist only in server-set `HttpOnly` cookies. `tokenStorage.js` stores sanitized public user details (`id`, `email`, `role`, `plan`).
- **Silent Refresh Deduplication:** When multiple requests encounter `401 Unauthorized` simultaneously, `interceptors.js` pauses them in a shared queue while single refresh executes, preventing token race conditions.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['ai', 'summary', targetType, targetId]` | `AuraSummary.jsx` |
| `['badgeCounts', userId]` | `useBadgeCounts.js` |
| `['enums']` | `useEnums.js` |
| `['globalSearch', activeTab, term]` | `UnifiedSearchBar.jsx` |
| `['locations', 'cities']` | `useLocationOptions.js` |
| `['locations', 'districts', cityKey]` | `useLocationOptions.js` |
| `['locations', 'neighborhoods', districtKey]` | `useLocationOptions.js` |
| `['membership', 'status', user?.id]` | `usePlan.js` |
| `['membership', 'quote']` | `PremiumUpgradeModal.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['auth']` | `PremiumUpgradeModal.jsx`, `usePlan.js` |
| `['membership', 'status']` | `usePlan.js` |
| `['membership']` | `PremiumUpgradeModal.jsx` |

## 5. Form & Data Validation Rules

- **Common Formatters:**
  - Phone numbers formatted via `phoneFormatter.js` to Turkish standard (`+90 5XX XXX XX XX`).
  - Dates formatted via `dateFormat.js` to localized formats (`DD.MM.YYYY HH:mm`).
  - Numbers and currencies formatted using `formatters.js` to `TRY` currency strings.
