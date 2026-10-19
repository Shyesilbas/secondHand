# Auth UI Module

Authentication flows, registration with step-by-step validation, password resets, and Google OAuth2 integration.

## Architecture
- `authService`: Handles login, logout, registration, and refresh calls to backend `/api/v1/auth/*`.
- `useRegisterForm`: Multi-field registration state manager wired to `registerValidator.js` for instant feedback on password strength and required inputs.
- `OAuthCallbackPage` & `OAuthCompletePage`: Receives OAuth redirect, sets authentication state, and redirects to destination or account onboarding.
- Interceptor Integration: Raw JWT tokens are stored in `HttpOnly` cookies (`sh_at`); Axios interceptors in `common/services/api/interceptors.js` handle silent 401 token refresh.

## Invariants
- **No Local Storage Tokens:** Authentication state relies strictly on server-issued `HttpOnly` and `SameSite` cookies; never store raw JWT credentials in `localStorage` or `sessionStorage`.
- **Silent Refresh Coordination:** Multiple concurrent 401 responses queue requests behind a single refresh promise to prevent duplicate rotation triggers.
- **Controlled Navigation:** Protected routes redirect unauthenticated users to `/login` with a `returnUrl` state to restore their previous context upon successful login.
