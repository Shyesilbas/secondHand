# Auth UI Module

Authentication flows, multi-step registration with synchronous password policy checks, account verification, password resets, and Google OAuth2 integration.

---

## 1. Overview & Purpose

The `auth` module provides the security perimeter and identity lifecycle for the frontend application. It manages session establishment, token renewal, registration onboarding, and federated identity:
1. **Cookie-Based JWT Session Management:** Access and refresh tokens are stored securely in `HttpOnly` and `SameSite` cookies (`sh_at`, `sh_rt`). Raw credentials are never stored in `localStorage` or `sessionStorage`.
2. **Silent Token Refresh Queue:** Axios interceptors intercept `401 Unauthorized` responses and queue concurrent requests behind a single refresh promise to prevent duplicate rotation triggers.
3. **Two-Step Registration:** Progressive onboarding separating credentials (email, password) from profile information (name, surname, phone, birth date, gender, mandatory legal agreements).
4. **Synchronous Password Policy Verification:** Strict client-side validation mirroring backend `@Pattern` rules before submission.
5. **Federated Google SSO:** Handles OAuth2 redirects, callback verification, onboarding profile completion, and error states.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/login` | `PublicRoute` | `LoginPage` | Email and password sign-in form; Google SSO button; supports `returnUrl` navigation state. |
| `/register` | `PublicRoute` | `RegisterPage` | Two-step registration wizard (`RegisterForm`) with live validation rules. |
| `/forgot-password` | `PublicRoute` | `ForgotPasswordPage` | Password recovery initiating reset code dispatch to registered email. |
| `/change-password` | `ProtectedRoute` | `ChangePasswordPage` | In-app password change requiring current password confirmation. |
| `/verify-email` | `PublicRoute` | `AccountVerificationPage` | 6-digit OTP verification screen completing email ownership checks. |
| `/oauth2/callback` | Public | `OAuthCallbackPage` | Receives backend redirect with authentication state, sets credentials, and forwards user. |
| `/oauth2/complete` | `ProtectedRoute` | `OAuthCompletePage` | Mandatory first-time profile completion for OAuth users lacking phone or birth date. |
| `/oauth2/error` | Public | `OAuthErrorPage` | Displays localized error card for failed SSO handshakes (ignores query string tampering). |

---

## 3. Component Hierarchy & Core Sub-Components

```
auth/
├── AuthContext.jsx                    # React Context declaration for authentication state
├── AuthProvider.jsx                   # Central session manager and lifecycle provider
├── auth.js                            # Request DTO factories and session constants
├── pages/
│   ├── LoginPage.jsx                  # Standard credentials entry
│   ├── RegisterPage.jsx               # Registration page wrapping RegisterForm
│   ├── ForgotPasswordPage.jsx         # Password reset initiation
│   ├── ChangePasswordPage.jsx         # Authenticated password update
│   ├── AccountVerificationPage.jsx    # Email OTP confirmation page
│   ├── OAuthCallbackPage.jsx          # Social login redirect handler
│   ├── OAuthCompletePage.jsx          # Social login profile gap filling
│   └── OAuthErrorPage.jsx             # Hardened error state screen
├── components/
│   ├── RegisterForm.jsx               # Two-step progressive registration wizard
│   ├── AuthPrimitives.jsx             # AuthBrand, AuthHeader, AuthField, PasswordField, PasswordRules, GoogleButton, AuthCard
│   └── GenderChoice.jsx               # Accessible gender radio button group
├── hooks/
│   ├── useRegisterForm.js             # Form state, step progression, and validation orchestration
│   └── useLoginPrompt.js              # Intercepts guest actions and opens the auth modal
├── services/
│   ├── authService.js                 # REST client for /api/v1/auth (login, logout, refresh, me)
│   ├── passwordService.js             # REST client for forgot-password, reset, and change endpoints
│   └── verificationService.js         # REST client for email/phone OTP verification
└── utils/
    ├── passwordRules.js               # Password regex rules and localized error string generator
    └── registerValidator.js           # Multi-step validation rules for registration
```

### Component Roles & Invariants
- **`AuthPrimitives.jsx` Standardization:** All authentication pages construct their interface using `AuthPrimitives` (`AuthCard`, `AuthHeader`, `AuthField`, `PasswordField`, `PasswordRules`, `GoogleButton`).
- **No Local Storage Tokens:** Raw JWT strings are never saved in local storage. `tokenStorage.js` stores only public user metadata (`id`, `email`, `role`, `plan`) for optimistic UI rendering.
- **`OAuthErrorPage` Hardening:** Displays fixed, static system error text. Does not render URL-supplied `message` query parameters to prevent reflected XSS.

---

## 4. State Management & React Query Contract

### Context State & Cache Clearance
- `useAuthState()` provides:
  - `user`: Public user profile object (`id`, `email`, `role`, `firstName`, `lastName`, `plan`, `planExpiry`).
  - `isAuthenticated`: Boolean status indicating verified session.
  - `isLoading`: Boolean status during initial bootstrap check.
- **Cache Eviction on Logout:** When `logout()` executes, `queryClient.clear()` is called immediately to purge all cached user data, orders, favorites, chat messages, and administrative payloads from memory.

### Interceptor Refresh Contract
- When an API response returns `401 Unauthorized`:
  1. The failed request is paused.
  2. The interceptor calls `POST /api/v1/auth/refresh`.
  3. If successful, queued requests are replayed transparently with new session cookies.
  4. If the refresh call fails, the session is invalidated, `clearUser()` is invoked, and the user is redirected to `/login`.

---

## 5. Form & Data Validation Rules

### Password Validation Policy (`passwordRules.js`)
The password policy strictly mirrors backend `@Pattern` validation:
- **Length:** At least 8 characters.
- **Uppercase:** At least one uppercase English letter (`A-Z`).
- **Lowercase:** At least one lowercase English letter (`a-z`).
- **Digit:** At least one numerical digit (`0-9`).
- **Special Character:** At least one of `@$!%*?&.`.
- **Illegal Characters:** No spaces or characters outside the allowed set.

### Registration Form Step Division (`useRegisterForm.js`)
- **Step 1 (Account):**
  - `email`: Valid email syntax check.
  - `password`: Must satisfy all `passwordRules` criteria.
  - `confirmPassword`: Must strictly match `password`.
- **Step 2 (Personal Details & Legal):**
  - `firstName` & `lastName`: Non-empty string (2-50 characters).
  - `phone`: Valid 10-digit mobile number format.
  - `birthDate`: User must be at least 18 years of age.
  - `agreements`: Mandatory acceptance of Terms of Service, Privacy Policy, and Consent contracts.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Auth submit buttons display an integrated spinner with disabled state; Google SSO button enters disabled state with `"Connecting..."`.
2. **Empty / Default State:** Clean card layout with high-contrast text fields and subtle placeholder guidelines.
3. **Error State:** Field-level errors appear beneath invalid inputs with `text-destructive text-sm`; server-level errors display an inline alert card.
4. **Data State:** Fully verified authentication with automatic redirection to original destination.

### Backend Error Contract
- **`INVALID_CREDENTIALS`:** Displays `"Invalid email or password"`.
- **`USER_ALREADY_EXISTS`:** Suggests logging in or resetting password.
- **`ACCOUNT_LOCKED`:** Advises user to contact platform support or wait out cooling-off period.
- **`EXPIRED_TOKEN`:** Surfaces expired verification or reset code alert and prompts resending.

### Restrained Design Tokens
- **Card Styling:** `bg-surface border-border shadow-sm max-w-md mx-auto rounded-md`.
- **Form Inputs:** Consistent `inputStyles` token (`bg-surface border-border focus:ring-1 focus:ring-primary focus:border-primary text-foreground`).
- **Social SSO:** Monochrome Google button with standardized brand mark and border; zero flashy gradient borders.
