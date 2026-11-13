# Security Audit UI Module

Security activity monitoring, active device session management, event log inspection, and global session revocation.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`user`](../../../src/main/java/com/serhat/secondhand/user/README.md)
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](../../../docs/auth-jwt-and-security-architecture.md)

## 1. Overview & Purpose

The `audit` module gives users complete transparency and control over their account security. It surfaces authentication activity, connected hardware sessions, and forensic event logs:
1. **Security Overview Dashboard:** High-level security status (`SecurityPage`) summarizing account health, password age, active session counts (`SecuritySummary`), and recognized devices (`SecurityDevices`).
2. **Paginated Security Event Stream:** Filterable chronological timeline (`SecurityActivityList`) tracking logins, password updates, and verification attempts with IP and geographic location hints.
3. **Forensic Event Inspector:** Detailed modal view (`LogDetailModal`) rendering complete event metadata, browser user agent strings, and request outcomes.
4. **Emergency Session Revocation:** One-click session kill switch (`RevokeSessionsModal`) enabling users to terminate all active sessions across all devices simultaneously.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/security` | `SecurityPage` | Protected |

| Embedded entry | Where |
|---|---|
| `LogDetailModal` | Inspection modal opened from individual audit event table rows. |
| `RevokeSessionsModal` | Dangerous action confirmation modal for terminating remote sessions. |

## 3. Component Rules

- **Session Revocation Cascade:** Executing global revocation calls `POST /v1/auth/revoke-all-sessions`, invalidating all active refresh tokens except the current browser session, and refetches device lists and audit logs immediately.
- **Sensitive Data Redaction:** IP addresses and user agents are sanitized before display; raw credentials and secrets are strictly excluded from audit payloads.
- **Spring Page Alignment:** Pagination aligns with Spring Boot zero-indexed page numbers.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

- No queries defined in this module.

## 5. Form & Data Validation Rules

- **Filter Criteria:**
  - `eventType`: values of the backend audit event enum (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `PASSWORD_CHANGE_SUCCESS`, `PASSWORD_CHANGE_FAILURE`).
  - `status`: `SUCCESS` or `FAILURE`.
