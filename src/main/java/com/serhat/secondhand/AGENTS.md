# Backend (Spring Boot, package `com.serhat.secondhand`)

Java 17, Spring Boot 3.5, JPA/PostgreSQL with Flyway (`src/main/resources/db/migration`, never edit existing migrations), Redis 7 (Lua + cache), Apache Kafka 3.7, MapStruct.
- Run app: `mvn spring-boot:run`
- Run tests: `mvn test -Dmaven.test.skip=false`
- Module business rules: `<module>/README.md`; task how-tos: `<module>/.docs/runbooks/`.

## Required Skills
Before modifying backend code, load the matching skill from `.agents/skills/`:
- **`transactional-outbox-and-redis-concurrency`** (`.agents/skills/transactional-outbox-and-redis-concurrency/SKILL.md`): Required for `payment`, `escrow`, `ewallet`, `order`, `checkout`, `inventory`, `cart`, `coupon`, `pricing`, `campaign`, `offer`, Kafka consumers/outbox workers, and Redis Lua or `@Cacheable` changes.
- **`polymorphic-catalog-and-layered-api`** (`.agents/skills/polymorphic-catalog-and-layered-api/SKILL.md`): Required for controllers, DTOs, `ResultResponses`, security (`@PublicEndpoint`, `@PreAuthorize`, IDOR), Flyway migrations, 6-vertical `listing` catalog, and JSON seed initializers.
- **`catalog-vertical-playbook`** (`.agents/skills/catalog-vertical-playbook/SKILL.md`): Required when adding or deepening a listing vertical's catalog (type rules, seeds, attributes, snapshotters, `/api/v1/catalog/*`, listing generator).
- **`backend-review-audit`** (`.agents/skills/backend-review-audit/SKILL.md`): For backend reviews and fixing findings by ID (GV/VT/PF/DB/SD/KK).

## Review Checklist
Business logic in a controller? Entity leaked? Rollback correct? N+1 or missing pagination? Main transaction broken by an event listener? Missing cache eviction, `@PreAuthorize` or ownership check? Deep dives: `docs/README.md`.
