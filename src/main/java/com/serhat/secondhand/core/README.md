# Core Domain

## Purpose
The `core` domain provides cross-cutting infrastructural services, including global security (JWT, CSRF, Rate Limiting), global error handling, standard API response wrappers, platform enum catalogs, and verification utilities (OTP).

## Architecture Overview
- **Security & JWT:** Uses `JwtUtils` and `AuthenticationFilter` for secure token management. Enforces CSRF via strict cookies and manages Rate Limits.
- **Dynamic Endpoints:** Routes are dynamically classified as public vs. protected using `@PublicEndpoint` via `PublicEndpointRegistry`.
- **Global Error Handling:** `GlobalExceptionHandler` ensures all exceptions are translated into a standardized JSON error shape.
- **Audit Logging:** An AOP `AuditAspect` asynchronously records sensitive actions to `audit_logs`.
- **Outbox Housekeeping:** `OutboxHousekeepingScheduler` purges processed outbox events older than the retention threshold.
- **Seeders:** Includes `CatalogSeedStartupRunner` for database initialization.

## Business Invariants & Constraints
- **Response Format:** All API responses must be wrapped in `Result<T>` and handled via `ResultResponses`.
- **Error Status:** `ResultResponses` takes the HTTP status of an error from the `ErrorCode` enum that declares its code (404, 403, 409, ...), even after the error was passed on as `Result.error(message, code)`. Codes no enum declares return 400. Two enums declaring one code with different statuses fail on first use (`core/result/ErrorCodeStatuses`).
- **Public Routing:** New unprotected endpoints must be explicitly annotated with `@PublicEndpoint`.
- **Statelessness:** JWT token validation is stateless but relies on refresh token rotation (RTR) managed in `auth`.

## Integration Points
- **Incoming:** Every HTTP request passes through `core` filters.
- **Outgoing:** Provides infrastructural utilities, exception handling, and error response envelopes to every other domain.

## Public APIs
- **Enum Catalog (`/api/v1/enums`):**
  - `GET /api/v1/enums/all`: Master dictionary of system enums, carrier names, vehicle type specifications, and field rules (cached, gzip).
- **Audit Logs (`/api/v1/admin/audit-logs` & `/api/v1/audit/enums` - Admin):**
  - `GET /api/v1/audit/enums/all`: Metadata of recorded event types and statuses.
  - `GET /api/v1/admin/audit-logs/*`: Historical audit trail queries filtered by user, event type, date range, or failed attempt thresholds.
- **Rate Limit Testing (`/api/v1/test/rate-limits`):**
  - Diagnostics for testing IP-based and auth-based rate limit buckets.
