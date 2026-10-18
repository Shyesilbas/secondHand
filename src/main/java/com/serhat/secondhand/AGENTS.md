# Backend (Spring Boot, package `com.serhat.secondhand`)

Java 17, Spring Boot 3.5, JPA/PostgreSQL with Flyway (`src/main/resources/db/migration`, never edit existing migrations), Redis, Kafka, MapStruct. Commands: `./mvnw spring-boot:run`, `./mvnw test`. Module business rules: `<module>/README.md`; task how-tos: `<module>/.docs/runbooks/`.

## Layers and API
- controller -> service -> validator -> repository -> mapper. Controllers are thin; business logic lives in `@Service` / validator / policy classes.
- Never return entities; use request/response DTOs with `jakarta.validation`.
- Controllers respond via `ResultResponses` (`ok`, `created`, `noContent`, ...): success body is the DTO itself, errors are `{ "error": "CODE", "message": "..." }`. Use error-code enums (e.g. `AuthErrorCodes`), not hardcoded strings.
- Role-restricted endpoints need `@PreAuthorize`; check ownership (IDOR) on user-scoped resources.
- Contract first for a new endpoint: method, path `/api/v1/<domain>/<resource>`, auth, DTOs, error codes. Implementation order: DTOs -> repository -> validator/policy -> service -> controller.

## Money, events, cache
- Payment / escrow / ewallet writes run under `@Transactional` with a defined rollback path. Side effects go through the outbox (`payment`, `order`, `escrow`) -> Kafka, never direct Kafka calls inside the transaction. Consumers must be idempotent (`processed_kafka_events`).
- Payments go through `PaymentProcessor` and a `PaymentProviderPort` adapter (only `EWALLET` today).
- Stock: Redis Lua reservation (15 min TTL) -> payment -> Kafka -> PostgreSQL decrement; the reconciliation scheduler repairs drift.
- Cache is Redis only (`v4::` keys, tiered TTLs). Every cache write path needs eviction; see `docs/multi-tier-redis-caching-and-invalidation.md`. There is no Caffeine/L1 cache.
- Request filter chain: `RateLimitingFilter` -> `CsrfCookieFilter` -> `AuthenticationFilter` (JWT) -> `SecurityHeadersFilter`. AOP: `AuditAspect`, `PriceHistoryAspect`, `OrderLogAspect`.

## Changing business rules
Read the module README, then change only validator -> service -> repository, keeping DTO and mapper consistent. In `auth`, `payment`, `escrow`, `ewallet`, `order`, `inventory` do not guess behavior and do not add silent fallbacks; fail with a clear error code.

## Review checklist
Business logic in a controller? Entity leaked? Rollback correct? N+1 or missing pagination? Main transaction broken by an event listener? Missing cache eviction, `@PreAuthorize` or ownership check? Deep dives: `docs/README.md`.
