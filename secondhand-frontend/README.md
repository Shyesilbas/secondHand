# SecondHand Frontend

React 19 single-page application for the SecondHand marketplace platform.

Detailed coding conventions and design standards live in [AGENTS.md](AGENTS.md) and `.agents/skills/restrained-ui-design-standard/SKILL.md`.

## Quick Start

### Prerequisites
- Node.js >= 18
- Running backend instance (default: `http://localhost:8080`)

### Setup and Running
```bash
# Install dependencies
npm install

# Start development server on port 5173
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview

# Run code style and syntax checks
npm run lint
```

Environment variables are configured in `.env` (copy from `.env.example`).

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend REST API base path |
| `VITE_WS_BASE_URL` | `ws://localhost:8080/ws` | Backend WebSocket (STOMP) endpoint |

## Architecture

- **UI Framework & Tooling:** React 19 with Vite 5. TailwindCSS 3 for utility styling with semantic color tokens in `src/common/constants/theme.js`.
- **Routing:** React Router 7 (`src/common/routes/AppRoutes.jsx`). Eagerly loads critical paths (`HomePage`, `AboutPage`) and uses React `Suspense` with code-splitting for feature screens.
- **Server State Management:** `@tanstack/react-query` v5. Server data is never duplicated into local React state. Default `staleTime` is 5 minutes; mutations invalidate affected query keys.
- **HTTP Client & Authentication:** Axios 1.11 via `src/common/services/api/request.js`.
  - Credentials and session tokens are stored in `HttpOnly`, `SameSite` cookies (`sh_at`, `sh_rt`).
  - Silent 401 token refresh queue is handled in `src/common/services/api/interceptors.js`.
  - CSRF protection uses double-submit cookie pattern reading `XSRF-TOKEN` into `X-XSRF-TOKEN` headers.
  - No JWT credentials or passwords are ever saved to `localStorage` or `sessionStorage`.
- **Real-Time Communication:** `@stomp/stompjs` over WebSocket via `src/common/hooks/useWebSocket.js`. Handles chat rooms (`/topic/chat/{roomId}`), user notification queues (`/user/{userId}/queue/messages`), and reconnection backoff.
- **Design Standard:** Apple/Spotify-tier restrained design standard: zero emojis, neutral surfaces, subtle hairline borders, and strict `rounded-md` radius ceiling.
- **User Feedback:** Global alerts and notifications use `NotificationContext` (`useNotification`); browser native `alert()` or `confirm()` calls are strictly forbidden.

## Directory Structure

```
secondhand-frontend/
├── src/
│   ├── admin/          # Admin coupon and platform operations
│   ├── agreements/     # Terms, privacy, and legal agreement modals
│   ├── ai/             # Aura AI assistant, chat page, and price advisor
│   ├── audit/          # Security activity logs and session management
│   ├── auth/           # Login, registration, password reset, OAuth2
│   ├── cart/           # Shopping cart, checkout steps, reservation timers
│   ├── chat/           # Direct user-to-user messaging and STOMP hooks
│   ├── common/         # Layout, shared UI primitives, routes, API clients
│   ├── comparison/     # Product comparison drawer and modal
│   ├── complaint/      # Support and complaint reporting flows
│   ├── coupon/         # Platform and discount coupon listings
│   ├── dashboard/      # Buyer and seller analytics and metric charts
│   ├── ewallet/        # Digital wallet balance, limits, and transactions
│   ├── favorites/      # Favorite listings and saved lists
│   ├── follow/         # Seller following system
│   ├── forum/          # Community discussion forum
│   ├── home/           # Landing page and platform about views
│   ├── inbox/          # Unified messaging and email notifications
│   ├── listing/        # Catalog browsing, filtering, and listing CRUD
│   ├── locales/        # Internationalization dictionaries (TR/EN)
│   ├── notification/   # Real-time toast and in-app notifications
│   ├── offer/          # Price bargaining, counter-offers, and negotiation cards
│   ├── order/          # Buyer and seller order lifecycle and meetup flows
│   ├── payments/       # Listing fee payments, wallet operations, and OTP
│   ├── reviews/        # User and listing star ratings and reviews
│   ├── showcase/       # Premium showcase listing boosts
│   └── user/           # User profile, address management, and badges
```

## Source of Truth

- **Business Rules:** Backend module `README.md` files (`src/main/java/com/serhat/secondhand/<module>/README.md`).
- **API Contracts:** Backend controllers and `src/common/constants/apiEndpoints.js`.
- **UI Design System:** `.agents/skills/restrained-ui-design-standard/SKILL.md` and `src/common/constants/theme.js`.
