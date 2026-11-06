# Auth UI Module

Authentication flows, registration with step-by-step validation, password resets, and Google OAuth2 integration.

## Architecture
- `authService`: Handles login, logout, registration, and refresh calls to backend `/api/v1/auth/*`.
- `useRegisterForm`: Registration state wired to `registerValidator.js`. The form has two steps: account (email, password), then details (name, surname, phone, birth date, gender, agreements); a failing account field sends the user back to step 1.
- `components/AuthPrimitives.jsx`: The only building blocks for auth screens (`AuthBrand`, `AuthHeader`, `AuthField`, `PasswordField`, `PasswordRules`, `GoogleButton`, `AuthCard`). Fields use the shared `inputStyles`; buttons use the shared `Button`.
- `utils/passwordRules.js`: Password rules that mirror the backend `@Pattern` (8+ characters, upper, lower, digit, one of `@$!%*?&.`, no other characters). Register, reset and change password all validate with `getPasswordError`.
- Code entry (password reset, account verification) uses `payments/components/verification/OtpDigitInputGroup`.
- `OAuthCallbackPage` & `OAuthCompletePage`: Receives OAuth redirect, sets authentication state, and redirects to destination or account onboarding.
- Interceptor Integration: Raw JWT tokens are stored in `HttpOnly` cookies (`sh_at`); Axios interceptors in `common/services/api/interceptors.js` handle silent 401 token refresh.

## Invariants
- **No Local Storage Tokens:** Authentication state relies strictly on server-issued `HttpOnly` and `SameSite` cookies; never store raw JWT credentials in `localStorage` or `sessionStorage`.
- **Silent Refresh Coordination:** Multiple concurrent 401 responses queue requests behind a single refresh promise to prevent duplicate rotation triggers.
- **No URL-supplied messages:** `OAuthErrorPage` shows fixed text and ignores any `message` query parameter.
- **Controlled Navigation:** Protected routes redirect unauthenticated users to `/login` with a `returnUrl` state to restore their previous context upon successful login.
