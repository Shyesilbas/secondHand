# Auth UI Module

Authentication flows, multi-step registration with synchronous password policy checks, account verification, password resets, and Google OAuth2 integration.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`auth`](../../../src/main/java/com/serhat/secondhand/auth/README.md)
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](../../../docs/auth-jwt-and-security-architecture.md)

## 1. Overview & Purpose
Session, registration and Google SSO screens. Tokens live only in `HttpOnly` cookies (`sh_at`, `sh_rt`); `interceptors.js` refreshes once on 401 and replays queued requests.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/auth/callback` | `OAuthCallbackPage` | Public |
| `/auth/complete` | `OAuthCompletePage` | Public |
| `/auth/error` | `OAuthErrorPage` | Public |
| `/change-password` | `ChangePasswordPage` | Protected |
| `/forgot-password` | `ForgotPasswordPage` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/verify-account` | `AccountVerificationPage` | Protected |

## 3. Component Rules

- **`AuthPrimitives.jsx` Standardization:** All authentication pages construct their interface using `AuthPrimitives` (`AuthCard`, `AuthHeader`, `AuthField`, `PasswordField`, `PasswordRules`, `GoogleButton`).
- **No Local Storage Tokens:** Raw JWT strings are never saved in local storage. `tokenStorage.js` stores only public user metadata (`id`, `email`, `role`, `plan`) for optimistic UI rendering.
- **`OAuthErrorPage` Hardening:** Displays fixed, static system error text. Does not render URL-supplied `message` query parameters to prevent reflected XSS.


## 4. React Query Keys

Generated from code; the hook files are the source of truth.

- No queries defined in this module.

| Invalidated / updated key | By |
|---|---|
| `['membership']` | `AuthProvider.jsx` |

## 5. State Management

### Interceptor Refresh Contract
- When an API response returns `401 Unauthorized`:
  1. The failed request is paused.
  2. The interceptor calls `POST /api/v1/auth/refresh`.
  3. If successful, queued requests are replayed transparently with new session cookies.
  4. If the refresh call fails, the session is invalidated, `clearUser()` is invoked, and the user is redirected to `/login`.

## 6. Form & Data Validation Rules
- **Password policy:** `PASSWORD_RULES` / `getPasswordError` in `utils/passwordRules.js` mirror the backend `@Pattern` (min 8, upper, lower, digit, one of `@$!%*?&.`, no other characters). Change both sides together.
- **Registration:** `useRegisterForm.js` formats `phone` (`formatPhoneNumber`) and `birthdate` (DD/MM/YYYY) while typing; required agreements come from `useRegisterAgreements`.
