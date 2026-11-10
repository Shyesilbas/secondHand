# Security Audit UI Module

Security activity monitoring, device session management, audit log inspection, and global session revocation.

## Architecture

- **`SecurityPage`:** Security center dashboard combining overall security score (`SecuritySummary`), device history (`SecurityDevices`), and the security event log (`SecurityActivityList`).
- **`useAuditLogsPagination`:** Hook orchestrating paginated query fetches from `/v1/users/audit-logs` with event type filters (`LOGIN`, `PASSWORD_CHANGE`, `VERIFICATION`), status filters (`SUCCESS`, `FAILURE`), and date range criteria.
- **Modals:**
  - `RevokeSessionsModal`: Confirmation modal allowing users to invalidate all active refresh tokens and device sessions across all platforms (`POST /v1/auth/revoke-all-sessions`).
  - `LogDetailModal`: Deep inspector modal displaying event metadata, client IP addresses, user agents, and raw audit payloads.
- **Components:**
  - `SecurityFilters`: Filtering bar for audit action categories and outcome statuses.
  - `SecurityDevices`: List of recognized active devices, operating systems, and last access timestamps.

## Invariants

- **Session Revocation Invalidation:** Revoking all sessions calls the auth revocation endpoint, invalidating backend token families, and refetches device lists and audit logs immediately.
- **Zero-Indexed Pagination:** Audit log pagination adheres to Spring Boot zero-indexed page numbers.
- **Sensitive Data Redaction:** IP addresses and user agent strings are displayed with safe fallbacks; no credential data is ever returned or rendered.
- **Restrained Styling:** Follows `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean monochromatic event lists, status dots using semantic status tokens, and zero emojis.

