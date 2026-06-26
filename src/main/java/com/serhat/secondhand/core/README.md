# Core Domain

## Purpose
The `core` domain provides cross-cutting infrastructural services, including global security (JWT, CSRF, Rate Limiting), global error handling, standard API response wrappers, and verification utilities (OTP).

## Architecture Overview
- **Security & JWT:** Uses `JwtUtils` and `AuthenticationFilter` for secure token management. Enforces CSRF via strict cookies and manages Rate Limits.
- **Dynamic Endpoints:** Routes are dynamically classified as public vs. protected using `@PublicEndpoint` via `PublicEndpointRegistry`.
- **Global Error Handling:** `GlobalExceptionHandler` ensures all exceptions are translated into a standardized JSON error shape.
- **Audit Logging:** An AOP `AuditAspect` asynchronously records sensitive actions.
- **Seeders:** Includes `CatalogSeedStartupRunner` for database initialization.

## Business Invariants & Constraints
- **Response Format:** All API responses must be wrapped in `Result<T>` and handled via `ResultResponses`.
- **Public Routing:** New unprotected endpoints must be explicitly annotated with `@PublicEndpoint`.
- **Statelessness:** JWT token validation is stateless but relies on refresh token rotation (RTR) managed in `auth`.

## Integration Points
- **Incoming:** Every HTTP request passes through `core` filters.
- **Outgoing:** Provides infrastructural utilities to every other domain.

## Public APIs
- Provides standard infrastructure; no direct business endpoints.

## Related Knowledge
- *(No runbooks extracted; modifications affect the entire application architecture)*
