# Modify Auth Rules

## Purpose
Provides execution instructions for modifying registration, token rotation, password reset, or OAuth flows.

## When to Load
- When modifying login/register/reset rules.
- When fixing a bug in the token rotation flow.
- When changing the structure of JWT or refresh tokens.

## When NOT to Load
- When modifying user profile business logic (`user` domain).
- When debugging simple database query errors unrelated to security rules.

## Assumptions
- `AuthService` orchestrates the flow.
- Security-critical logic requires verifying state (e.g., is account ACTIVE).

## Procedure

### Registration
1. Preserve unique user validation checks before persistence.
2. Ensure `agreementsAccepted` validation occurs prior to saving.

### Token Behavior
1. Update `TokenService` methods.
2. If using bulk updates in `TokenRepository`, respect the transactional boundaries.
3. Refresh logic must validate both JWT signature and DB status.

### Password Rules
1. Manage verification code checks in `PasswordService.resetPassword`.
2. Do not remove the "confirm password" validation.

### Pitfalls
- Minting tokens before a successful database save.
- Distributing hardcoded error strings instead of `AuthErrorCodes`.
- Skipping DB status checks during token refresh.

## Related Files
- `src/main/java/com/serhat/secondhand/auth/application/AuthService.java`
- `src/main/java/com/serhat/secondhand/auth/application/TokenService.java`
