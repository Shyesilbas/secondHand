# Backend (Spring Boot, package `com.serhat.secondhand`)

Java 17, Spring Boot 3.5, JPA/PostgreSQL with Flyway (`src/main/resources/db/migration`, never edit existing migrations), Redis 7 (Lua + cache), Apache Kafka 3.7, MapStruct.
- Run app: `./mvnw spring-boot:run`
- Run tests: `./mvnw test -Dmaven.test.skip=false`
- Module business rules: `<module>/README.md`; task how-tos: `<module>/.docs/runbooks/`.

## Required Skills
Before modifying backend code, load the matching skill from `.agents/skills/`:
- **`transactional-outbox-and-redis-concurrency`** (`.agents/skills/transactional-outbox-and-redis-concurrency/SKILL.md`): Required for `payment`, `escrow`, `ewallet`, `order`, `checkout`, `inventory`, `cart`, `coupon`, `offer`, Kafka consumers/outbox workers, and Redis Lua or `@Cacheable` changes.
- **`polymorphic-catalog-and-layered-api`** (`.agents/skills/polymorphic-catalog-and-layered-api/SKILL.md`): Required for controllers, DTOs, `ResultResponses`, security (`@PublicEndpoint`, `@PreAuthorize`, IDOR), Flyway migrations, 6-vertical `listing` catalog, and JSON seed initializers.

## Review Checklist
Business logic in a controller? Entity leaked? Rollback correct? N+1 or missing pagination? Main transaction broken by an event listener? Missing cache eviction, `@PreAuthorize` or ownership check? Deep dives: `docs/README.md`.
