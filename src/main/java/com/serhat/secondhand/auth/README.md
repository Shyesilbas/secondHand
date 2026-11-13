# Auth Domain

Manages user registration, credential and Google OAuth2 login, `HttpOnly` JWT cookie issuance (`access_token`, `refresh_token`), Refresh Token Rotation (RTR) with family-wide replay theft revocation (`tokens` table), session revocation (`AccessRevocationService`), two-tier login throttling (`LoginAttemptService`), and password reset/change flows.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](/docs/auth-jwt-and-security-architecture.md) (RTR token families, cookie security, OAuth2 flow)
> - **Architecture Deep Dive:** [`docs/rate-limiting-and-throttling-architecture.md`](/docs/rate-limiting-and-throttling-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/auth/README.md`](/secondhand-frontend/src/auth/README.md)
> - **Key Entry Points:** [`AuthController`](api/AuthController.java) · [`PasswordController`](api/PasswordController.java) · [`TokenService`](application/TokenService.java) · [`RegistrationService`](application/RegistrationService.java) · [`LoginAttemptService`](application/LoginAttemptService.java) · [`AccessRevocationService`](application/AccessRevocationService.java) · [`PasswordService`](application/PasswordService.java) · [`TokenCleanupScheduler`](application/TokenCleanupScheduler.java)

## Business Rules & Invariants
- **Registration & Account Standing:** `RegistrationValidator` enforces unique email/phone, mandatory legal agreement consent (`agreementsAccepted == true`), and BCrypt password hashing. Login requires `AccountStatus.ACTIVE` (`AccountNotActiveException` on `BLOCKED`/`SUSPENDED`/`DELETED`).
- **HttpOnly Cookies & Refresh Token Rotation (RTR):** Tokens live in `HttpOnly`, `SameSite`, `Secure` cookies (`CookieUtils`), never in JSON bodies or `localStorage`. Rotating a refresh token (`POST /api/v1/auth/refresh`) marks the parent `Token` row `TokenStatus.REVOKED` and issues a child in the same `family_id`. If an already-`REVOKED` refresh token is presented (replay theft), `TokenService` immediately revokes the entire token family (`revokeAllByFamilyId`) and returns `401 INVALID_REFRESH_TOKEN`.
- **Housekeeping (`TokenCleanupScheduler`):** Purges expired/revoked `tokens` rows older than 30 days daily at midnight.
- **Change rule:** Tokens are minted only after the user/token rows are saved; refresh validates both the JWT signature and the stored token status.

## Redis & Throttling Keys
- `LoginAttemptService` (15m TTL): `auth:login-fail:ip:{clientIp}` and `auth:login-fail:account:{email}:{clientIp}`.
- `AccessRevocationService`: `auth:access-revoked:{userId}` (user revocation watermark) and `auth:access-token-revoked:{tokenId}` (single-JWT revocation marker).
- `PasswordService` (15m TTL): `auth:pwreset:requests:{emailSha256}`.

## API
- **`AuthController` (`/api/v1/auth`):** `POST /register` (`RegisterRequest`) · `POST /login` · `POST /logout` · `POST /refresh` · `POST /revoke-all-sessions` · `GET /oauth2/google` (`OAuth2LoginSuccessHandler`).
- **`PasswordController` (`/api/v1/auth/passwords`):** `POST /forgot` · `POST /reset` · `PUT /change`.
