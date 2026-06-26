# Auth Domain

## Purpose
The `auth` domain governs user authentication and session management, including registration, login, logout, refresh token rotation, OAuth completion, and password lifecycle.

## Architecture Overview
- **TokenService:** Manages persistence and status updates for refresh tokens in the database.
- **AuthService:** Orchestrates the core authentication business logic and acts as the entry point for login and register flows.
- **PasswordService:** Manages password reset logic, requiring active verification codes.
- **TokenCleanupScheduler:** Periodically cleans up expired tokens from the persistence layer.

## Business Invariants & Constraints
- **Registration Agreement:** A user cannot register without accepting all mandatory agreements (`agreementsAccepted == true`).
- **Token Validity:** A refresh token must be valid both cryptographically (JWT signature) AND actively stored as `ACTIVE` in the database.
- **Password Constraints:** Password resets require an active verification code and must ensure `newPassword == confirmPassword`. The new password cannot match the existing password.
- **Login Status:** An account must be in an `ACTIVE` status to allow login credentials to be validated.

## State Machines
- **Token Status:** `ACTIVE` -> `REVOKED` or `EXPIRED`.
- **Account Status Validation:** Checked implicitly during the `login` flow via `UserDetailsServiceImpl`.

## Integration Points
- **Incoming:** HTTP requests from the client.
- **Outgoing:** Delegates JWT technical parsing to `core.jwt`, and user profile data to the `user` domain.

## Public APIs
- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`
- `/api/auth/oauth2/complete`
- `/api/auth/password/change`, `/api/auth/password/forgot`, `/api/auth/password/reset`

## Related Knowledge
- **Modify Auth Rules**
  -> `.docs/runbooks/modify-auth-rules.md`
