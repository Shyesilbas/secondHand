# Common & Shared Infrastructure UI Module

Core foundation for the frontend application: HTTP networking, authentication interceptors, design tokens, route guards, layout primitives, and shared UI components.

---

## 1. Overview & Purpose

The `common` module serves as the architectural backbone of the `secondhand-frontend` single-page application. It encapsulates cross-cutting infrastructure used by all domain feature modules:
1. **Centralized HTTP Client & Network Interceptors:** Single Axios instance (`request.js`, `config.js`) enforcing CSRF protection, request serialization, and transparent silent 401 token refresh queues.
2. **Accessible Route Guards:** Standardized route wrapper components (`ProtectedRoute`, `PublicRoute`, `AdminRoute`) regulating access based on authentication status and user roles.
3. **Application Shell & Layout Primitives:** Reusable layouts (`MainLayout`, `AuthLayout`, `PageContainer`) providing responsive containers, header navigation, and footers.
4. **Restrained UI Primitives:** Accessible, battle-tested UI primitives (`Button`, `Modal`, `Alert`, `Skeleton`, `EmptyState`, `DataPagination`) adhering strictly to Apple/Spotify-tier aesthetic standards.
5. **Cross-Cutting Hooks & Utils:** Generalized state utilities including debouncing (`useDebouncedValue`), STOMP WebSockets (`useWebSocket`), enum registries (`useEnums`), and click-outside listeners (`useClickOutside`).

---

## 2. Route Map & Entry Points

| Guard / Wrapper | Target Audience | Behavior | Handled Paths |
|---|---|---|---|
| `ProtectedRoute` | Authenticated Members | Allows access; redirects unauthenticated guests to `/login` with `returnUrl` state. | `/cart`, `/checkout`, `/orders/*`, `/inbox`, `/account`, `/favorites` |
| `PublicRoute` | Guests / Unauthenticated | Allows guest access; redirects authenticated users to `/` to prevent duplicate auth. | `/login`, `/register`, `/forgot-password` |
| `AdminRoute` | Administrators | Requires `user.role === 'ADMIN'`; redirects non-admin users to `/login` or home. | `/admin/*` |
| `MainLayout` | Global App Shell | Wraps standard feature pages with `Header`, navigation, and `Footer`. | `/*` (except auth screens) |
| `AuthLayout` | Minimalist Auth Shell | Centered card container for sign-in, registration, and recovery screens. | `/login`, `/register`, `/forgot-password` |

---

## 3. Component Hierarchy & Core Sub-Components

```
common/
├── routes/
│   ├── AppRoutes.jsx                  # Master declarative route table
│   ├── ProtectedRoute.jsx             # Authentication guard
│   ├── PublicRoute.jsx                # Guest-only guard
│   └── AdminRoute.jsx                 # Role-based administrator guard
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx             # Shell with Header, Footer, and PageContainer
│   │   ├── AuthLayout.jsx             # Minimalist auth shell
│   │   ├── PageContainer.jsx          # Responsive max-w-7xl content container
│   │   └── header/
│   │       ├── Header.jsx             # Global navbar with search, badges, and user menu
│   │       └── LanguageSwitcher.jsx   # TR / EN language toggle
│   ├── ui/
│   │   ├── Button.jsx                 # Standardized button with loading state
│   │   ├── Modal.jsx                  # Accessible dialog with focus trap and escape listener
│   │   ├── Alert.jsx                  # Semantic alert banner (info, success, warning, error)
│   │   ├── Skeleton.jsx               # SkeletonCard, SkeletonList, SkeletonGrid
│   │   ├── EmptyState.jsx             # Clean empty state with icon, title, and action
│   │   └── DataPagination.jsx         # Spring Boot zero-indexed pagination bar
│   ├── forms/                         # Form controls and input styling wrappers
│   └── ErrorBoundary.jsx              # Global React crash safety net
├── services/
│   ├── api/
│   │   ├── request.js                 # Central get, post, put, patch, del HTTP methods
│   │   ├── interceptors.js            # CSRF injection and queued 401 refresh handler
│   │   └── config.js                  # Axios instance configuration (withCredentials)
│   ├── storage/
│   │   └── tokenStorage.js            # Sanitized user cache manager (no raw tokens)
│   ├── cacheService.js                # In-memory transient cache helper
│   ├── enumService.js                 # Backend enum dictionary retriever
│   └── membershipService.js           # User membership and quota service
├── hooks/
│   ├── useEnums.js                    # React Query cached backend enums (/v1/enums/all)
│   ├── useLocationOptions.js          # Cascading city/district selection hook
│   ├── useDebouncedValue.js           # Value debouncing for search and filters
│   ├── useWebSocket.js                # STOMP client lifecycle manager
│   ├── useBadgeCounts.js              # Unread badge counter aggregator
│   ├── usePlan.js                     # Account tier and quota checker
│   ├── useClickOutside.js             # Click outside event listener
│   ├── useEscapeKey.js                # Keyboard escape dismiss hook
│   └── useDropdownManager.js          # Dropdown focus and open state manager
├── theme/
│   └── theme.js                       # Semantic color tokens and typography definitions
├── constants/
│   ├── apiEndpoints.js                # Exhaustive backend REST/WS endpoint directory
│   ├── routes.js                      # Application path constants
│   ├── pagination.js                  # Global page size defaults
│   └── otp.js                         # OTP code length constants
├── utils/
│   ├── errorUtils.js                  # Dual-track ProblemDetail/ResultResponses parser
│   ├── dateFormat.js                  # Standard date/time formatters
│   ├── phoneFormatter.js              # Mobile number mask and normalizer
│   ├── imageOptimizer.js              # Cloudinary URL transform generator
│   └── logger.js                      # Sanitized development console logger
├── errorHandler.js                    # Standard handleError bridge to notifications
└── successHandler.js                  # extractSuccessMessage extractor
```

### Component Roles & Invariants
- **Zero Direct Axios Usage:** All application API requests must pass through `request.js`. Feature modules never import Axios directly.
- **No Token Storage in LocalStorage:** Raw JWT credentials exist only in server-set `HttpOnly` cookies. `tokenStorage.js` stores sanitized public user details (`id`, `email`, `role`, `plan`).
- **Silent Refresh Deduplication:** When multiple requests encounter `401 Unauthorized` simultaneously, `interceptors.js` pauses them in a shared queue while single refresh executes, preventing token race conditions.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['enums', 'all']` | Platform-wide enum catalogs | 60 min (`3600000ms`) | 24 hours | Static catalog cache |
| `['locations', 'cities']` | City and district listings | 60 min (`3600000ms`) | 24 hours | Static geographic cache |
| `['user', 'badges']` | Action badge counts (orders, chat) | 30 sec (`30000ms`) | 2 min (`120000ms`) | WebSocket notification or message |

---

## 5. Form & Data Validation Rules

- **Common Formatters:**
  - Phone numbers formatted via `phoneFormatter.js` to Turkish standard (`+90 5XX XXX XX XX`).
  - Dates formatted via `dateFormat.js` to localized formats (`DD.MM.YYYY HH:mm`).
  - Numbers and currencies formatted using `formatters.js` to `TRY` currency strings.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `Skeleton` primitives provide matching geometric placeholders (`SkeletonCard`, `SkeletonList`, `SkeletonGrid`).
2. **Empty State:** `EmptyState` provides a clean outline icon, heading, descriptive copy, and a primary action button.
3. **Error State:** `Alert` renders contextual alert banners with accessible ARIA live regions and retry triggers.
4. **Data State:** Fully rendered responsive layouts with high readability and consistent padding.

### Backend Error Contract
- Handled through `errorHandler.js` and `errorUtils.js`.
- Automatically unwraps both RFC 7807 `ProblemDetail` structures (`detail`, `title`, `violations`) and platform `ResultResponses` (`message`, `errorCode`, `status`).

### Restrained Design Tokens (`theme.js`)
- **Radius Ceiling:** Strict adherence to `rounded-md` (6px) on cards, buttons, dialogs, and inputs.
- **Surfaces:**
  - Base: `bg-background` (clean white in light mode, deep zinc in dark mode).
  - Cards: `bg-surface` with `border-border`.
  - Secondary: `bg-surface-alt`.
- **Borders:** Thin hairline borders (`border border-border`).
- **Zero Emojis:** Standard SVG outline icons only; no decorative or celebratory emojis.
