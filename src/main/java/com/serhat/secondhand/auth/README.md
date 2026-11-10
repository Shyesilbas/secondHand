# Auth Domain

## Purpose
The `auth` domain governs user authentication and session management, including registration, login, logout, refresh token rotation (RTR), OAuth2 completion, session revocation, and password lifecycle.

## Architecture Overview
- **TokenService:** Manages persistence, status updates, and verification for refresh tokens in PostgreSQL.
- **AuthService:** Orchestrates core authentication business logic and acts as the entry point for login and register flows.
- **PasswordService:** Manages password reset and change logic, requiring active verification codes.
- **TokenCleanupScheduler:** Periodically purges expired and revoked refresh tokens from the persistence layer.

## Business Invariants & Constraints
- **Registration Agreement:** A user cannot register without accepting all mandatory legal agreements (`agreementsAccepted == true`).
- **Token Validity:** A refresh token must be valid both cryptographically (JWT signature) and actively persisted with status `ACTIVE` in the database.
- **Password Constraints:** Password resets require an active verification code and must ensure `newPassword == confirmPassword`. The new password cannot match the existing password.
- **Login Status:** An account must be in an `ACTIVE` status (`AccountStatus.ACTIVE`) to authenticate.

## State Machines
- **Refresh Token Status (`TokenStatus`):** `ACTIVE` -> `REVOKED` or `EXPIRED`.
- **Account Status Validation:** Checked implicitly during the `login` flow via `UserDetailsServiceImpl`.

## Integration Points
- **Incoming:** HTTP requests via `AuthController` and `PasswordController`.
- **Outgoing:** Delegates JWT signing/validation to `core.jwt`, and user profile persistence to the `user` domain.

## Public APIs
- `POST /api/v1/auth/register`: Registers a new user account.
- `POST /api/v1/auth/login`: Authenticates user credentials and issues access & refresh tokens.
- `POST /api/v1/auth/logout`: Revokes active refresh token for current session.
- `POST /api/v1/auth/refresh`: Rotates refresh token and issues a new access token.
- `GET /api/v1/auth/oauth2/google`: Initiates Google OAuth2 login flow.
- `POST /api/v1/auth/oauth2/complete`: Finalizes registration/login for OAuth2 authenticated users.
- `POST /api/v1/auth/revoke-all-sessions`: Revokes all active refresh tokens for the authenticated user.
- `PUT /api/v1/auth/passwords/change`: Changes password for an authenticated user.
- `POST /api/v1/auth/passwords/forgot`: Initiates password reset by sending a verification code.
- `POST /api/v1/auth/passwords/reset`: Resets password using the received verification code.

## Related Knowledge
- **Modify Auth Rules**
  -> `.docs/runbooks/modify-auth-rules.md`
