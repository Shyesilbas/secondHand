# Security Audit UI Module

Security activity monitoring, active device session management, event log inspection, and global session revocation.

---

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

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/security` (or `/account?tab=security`) | `ProtectedRoute` | `SecurityPage` | Central account security hub rendering device sessions and audit activity logs. |
| In-Modal / Embedded | `ProtectedRoute` | `LogDetailModal` | Inspection modal opened from individual audit event table rows. |
| In-Modal / Embedded | `ProtectedRoute` | `RevokeSessionsModal` | Dangerous action confirmation modal for terminating remote sessions. |

---

## 3. Component Hierarchy & Core Sub-Components

```
audit/
├── pages/
│   └── SecurityPage.jsx               # Security center dashboard layout
├── components/
│   ├── SecuritySummary.jsx            # Account health score and active device counters
│   ├── SecurityDevices.jsx            # Active device sessions list with revoke triggers
│   ├── SecurityActivityList.jsx       # Tabular security events log with status badges
│   ├── SecurityFilters.jsx            # Filter bar for event type, outcome, and date range
│   ├── PaginationControls.jsx         # Accessible pagination navigator for audit logs
│   ├── LogDetailModal.jsx             # Deep inspection dialog for individual event payloads
│   └── RevokeSessionsModal.jsx        # Confirmation dialog for global token revocation
├── hooks/
│   └── useAuditLogsPagination.js      # React Query hook for paginated logs and filter states
├── services/
│   └── auditLogService.js             # REST client for /v1/users/audit-logs and session endpoints
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **Session Revocation Cascade:** Executing global revocation calls `POST /v1/auth/revoke-all-sessions`, invalidating all active refresh tokens except the current browser session, and refetches device lists and audit logs immediately.
- **Sensitive Data Redaction:** IP addresses and user agents are sanitized before display; raw credentials and secrets are strictly excluded from audit payloads.
- **Spring Page Alignment:** Pagination aligns with Spring Boot zero-indexed page numbers.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['security', 'devices']` | Active recognized devices list | 1 min (`60000ms`) | 5 min (`300000ms`) | Session revocation action |
| `['security', 'auditLogs', page, filters]` | Paginated security log events | 30 sec (`30000ms`) | 5 min (`300000ms`) | Filter changes or manual refresh |
| `['security', 'summary']` | Security health metrics and score | 2 min (`120000ms`) | 10 min (`600000ms`) | Password update or 2FA toggle |

### Hooks Contract
- `useAuditLogsPagination(initialFilters)`: Exposes `{ logs, pagination, filters, setFilter, setPage, isLoading, isError, refetch }`.

---

## 5. Form & Data Validation Rules

- **Filter Criteria:**
  - `eventType`: Filter by `LOGIN`, `LOGOUT`, `PASSWORD_CHANGE`, `PHONE_UPDATE`, `EMAIL_VERIFICATION`.
  - `status`: Filter by `SUCCESS`, `FAILURE`, `BLOCKED`.
  - `dateRange`: ISO date strings bounded by maximum 90-day query windows.
- **Revocation Confirmation:** Requires explicit textual confirmation ("REVOKE") in modal before dispatching global session termination.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `SecurityActivityList` renders skeleton table rows; `SecurityDevices` shows device card skeletons.
2. **Empty State:** Clean empty log card stating `"No security events found for selected filters"`.
3. **Error State:** Surfaces inline alert banner with a retry action if audit logs fail to load.
4. **Data State:** Clean tabular stream featuring event action badges, status dots (green for success, red for failure), device icons, and timestamp tooltips.

### Backend Error Contract
- Handled through `useNotification` toasts.
- Known error codes:
  - `SESSION_REVOCATION_FAILED`: Failure during token family revocation.
  - `AUDIT_LOG_UNAVAILABLE`: Audit service temporarily unreachable.

### Restrained Design Tokens
- **Outcome Status Indicators:**
  - `SUCCESS`: Restrained emerald dot (`bg-emerald-500`).
  - `FAILURE`: Restrained crimson dot (`bg-destructive`).
  - `BLOCKED`: Restrained amber dot (`bg-amber-500`).
- **Device Icons:** Standard neutral laptop, smartphone, or tablet icons without heavy borders.
- **Radii:** Standard `rounded-md` across cards, tables, and modal frames.
