# Core Domain

Provides cross-cutting platform infrastructure: the Spring Security filter chain (`SecurityConfig`), distributed Redis Lua rate limiting (`RateLimitingFilter`), stateless JWT resolution (`AuthenticationFilter`), `@PublicEndpoint` discovery (`PublicEndpointRegistry`), dual-track error handling (`ResultResponses` + `GlobalExceptionHandler`), Redis cache configuration (`CacheConfig`), outbox housekeeping (`OutboxHousekeepingScheduler`), deterministic catalog seeding (`CatalogSeedStartupRunner`), audit logging (`AuditAspect`), and OTP verification (`VerificationService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dives:** [`docs/redis-and-kafka-architecture.md`](/docs/redis-and-kafka-architecture.md) · [`docs/multi-tier-redis-caching-and-invalidation.md`](/docs/multi-tier-redis-caching-and-invalidation.md) · [`docs/rate-limiting-and-throttling-architecture.md`](/docs/rate-limiting-and-throttling-architecture.md) · [`docs/error-handling-and-contract-architecture.md`](/docs/error-handling-and-contract-architecture.md) · [`docs/database-migration-and-seeding-guide.md`](/docs/database-migration-and-seeding-guide.md) · [`docs/ci-cd-and-deployment-guide.md`](/docs/ci-cd-and-deployment-guide.md)
> - **Frontend Module:** [`secondhand-frontend/src/common/README.md`](/secondhand-frontend/src/common/README.md)
> - **Key Entry Points:** [`SecurityConfig`](config/SecurityConfig.java) · [`CacheConfig`](config/CacheConfig.java) · [`SchedulerLockConfig`](config/SchedulerLockConfig.java) · [`KafkaConfig`](config/KafkaConfig.java) · [`RateLimitingFilter`](security/RateLimitingFilter.java) · [`AuthenticationFilter`](jwt/AuthenticationFilter.java) · [`CsrfCookieFilter`](security/CsrfCookieFilter.java) · [`SecurityHeadersFilter`](security/SecurityHeadersFilter.java) · [`PublicEndpointRegistry`](security/PublicEndpointRegistry.java) · [`GlobalExceptionHandler`](exception/GlobalExceptionHandler.java) · [`ResultResponses`](result/ResultResponses.java) · [`ResultFailureException`](result/ResultFailureException.java) · [`ErrorCodeStatuses`](result/ErrorCodeStatuses.java) · [`EnumCatalogService`](application/EnumCatalogService.java) · [`EnumReadService`](application/EnumReadService.java) · [`OutboxHousekeepingScheduler`](outbox/OutboxHousekeepingScheduler.java) · [`CatalogSeedStartupRunner`](seed/CatalogSeedStartupRunner.java) · [`VerificationService`](verification/VerificationService.java)

## Business Rules & Invariants
- **Security Filter Order (`SecurityConfig`):** `SecurityHeadersFilter` (OWASP headers) -> `RateLimitingFilter` (`ClientIpResolver` + `rate_limit_window.lua`, returns `429`) -> `AuthenticationFilter` (stateless JWT cookie/Bearer parser + `AccessRevocationService` check) -> `CsrfCookieFilter` (double-submit `XSRF-TOKEN`) -> `PublicEndpointRegistry` (`@PublicEndpoint` vs `@PreAuthorize`).
- **Dual-Track Error Envelope:** Controllers return typed `ResponseEntity<T>` via `ResultResponses`, which throws `ResultFailureException` on `Result.error(...)` (`GlobalExceptionHandler` maps it via `ErrorCodeStatuses` to Track A `{"error": CODE, "message": "..."}`). Directly thrown exceptions render RFC 7807 `ProblemDetail` with `"message"` and `"error"`.
- **Scheduling, Outbox, Seeding, Audit & OTP:**
  - `SchedulerLockConfig` secures scheduled jobs with Redis-backed ShedLock (`v4:lock:scheduler` prefix) before `@Transactional` execution.
  - `OutboxHousekeepingScheduler` purges `PROCESSED` rows older than 7 days from `payment_outbox_events`, `order_outbox_events`, and `escrow_outbox_events`.
  - `CatalogSeedStartupRunner` executes `SeedTask` beans when `--app.seed` is passed and prunes unreferenced legacy rows via `CatalogLegacyPruner`.
  - `AuditAspect` records `@Auditable` actions asynchronously into `audit_logs`.
  - `VerificationService` validates 6-digit OTPs (`CodeType`); 3 failed attempts trigger a 15-minute `VerificationLockedException` cooldown.

## Redis & Caching
- Rate-limit keys (`RateLimitingFilter`, 60s window): `ratelimit:{category}:ip:{clientIp}:{windowBucket}` and `ratelimit:{category}:user:{userId}:{windowBucket}`.
- Spring Cache (`CacheConfig`): `v4:<cacheName>:` prefix (`CacheConfig.CACHE_VERSION`) with explicit per-cache TTLs and `CacheErrorHandlerConfig` fail-open logging.

## API
- `GET /api/v1/enums/all` (`EnumController`, `@PublicEndpoint`) — cached dictionary of system enums, type rules, and catalog metadata.
- `GET /api/v1/admin/audit-logs` (`AuditLogController`, `ROLE_ADMIN`) — paginated audit log search.
- `GET /api/v1/test/rate-limits/ping` (`RateLimitTestController`) — rate-limit header diagnostic endpoint.
