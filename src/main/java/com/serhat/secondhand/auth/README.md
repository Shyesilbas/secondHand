# Auth Domain

Manages user registration, credential and Google OAuth2 login, `HttpOnly` JWT cookie issuance (`sh_at`, `sh_rt`), Refresh Token Rotation (RTR) with family-wide replay theft revocation (`tokens` table), session revocation (`AccessRevocationService`), two-tier login throttling (`LoginAttemptService`), and password reset/change flows.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](/docs/auth-jwt-and-security-architecture.md) (RTR token families, cookie security, OAuth2 flow)
> - **Architecture Deep Dive:** [`docs/rate-limiting-and-throttling-architecture.md`](/docs/rate-limiting-and-throttling-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/auth/README.md`](/secondhand-frontend/src/auth/README.md)
> - **Key Entry Points:** [`AuthController`](api/AuthController.java) · [`PasswordController`](api/PasswordController.java) · [`TokenService`](application/TokenService.java) · [`RegistrationService`](application/RegistrationService.java) · [`LoginAttemptService`](application/LoginAttemptService.java) · [`AccessRevocationService`](application/AccessRevocationService.java) · [`PasswordService`](application/PasswordService.java) · [`TokenCleanupScheduler`](application/TokenCleanupScheduler.java)

## Business Rules & Invariants
- **Registration & Account Standing:** `RegistrationValidator` enforces mandatory legal agreement consent (`agreementsAccepted == true`); passwords are BCrypt-hashed.
- **No account enumeration on register:** `RegistrationService` answers a taken email or phone with the same `RegisterResponse` as a new account and still spends the BCrypt hash time; nothing is created. Agreements are validated first so their error cannot reveal an existing account. Login requires `AccountStatus.ACTIVE` (`AccountNotActiveException` on `PENDING`/`CLOSED`/`BLOCKED`).
- **Verification code on demand:** registration (`UserRegisteredEvent` -> `UserNotificationService.onUserRegistered`) sends only the welcome email. The account verification code is sent when the user presses send on the verification page (`VerificationService.sendAccountVerificationCode`).
- **HttpOnly Cookies & Refresh Token Rotation (RTR):** Tokens live in `HttpOnly`, `SameSite`, `Secure` cookies (`CookieUtils`), never in JSON bodies or `localStorage`. Rotating a refresh token (`POST /api/v1/auth/refresh`) marks the parent `Token` row `TokenStatus.REVOKED` and issues a child in the same `family_id`. If a refresh token that is no longer active is presented (replay theft), `LoginService` revokes the entire token family (`TokenService.revokeTokenFamily`) and returns `401 REVOKED_REFRESH_TOKEN`.
- **Housekeeping (`TokenCleanupScheduler`):** every 5 minutes (ShedLock) marks past-expiry `ACTIVE` tokens `EXPIRED`, then deletes rows of any status expired for more than `EXPIRED_TOKEN_RETENTION` (7 days; revoked rows are kept that long for reuse detection).
- **Change rule:** Tokens are minted only after the user/token rows are saved; refresh validates both the JWT signature and the stored token status.

## Redis & Throttling Keys
- `LoginAttemptService` (15m TTL): `auth:login-fail:ip:{clientIp}` and `auth:login-fail:account:{email}:{clientIp}`.
- `AccessRevocationService`: `auth:access-revoked:{userId}` (user revocation watermark) and `auth:access-token-revoked:{tokenId}` (single-JWT revocation marker).
- `PasswordService` (`RESET_CODE_WINDOW`, 1h): `auth:pwreset:requests:{emailSha256}` counts reset-code requests, at most `MAX_RESET_CODES_PER_WINDOW` per window.

## API
- **`AuthController` (`/api/v1/auth`):** `POST /register` (`RegisterRequest`) · `POST /login` · `POST /logout` · `POST /refresh` · `POST /revoke-all-sessions` · `GET /oauth2/google` (`OAuth2LoginSuccessHandler`) · `POST /oauth2/complete` (finish Google sign-up with accepted agreements, `OAuthService`).
- **`PasswordController` (`/api/v1/auth/passwords`):** `POST /forgot` · `POST /reset` · `PUT /change`.
