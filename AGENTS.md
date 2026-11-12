# secondHand — Unified Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL 15, Redis 7, Kafka 3.7) and React 19 frontend (`secondhand-frontend/`). This file is the single canonical source of truth for all AI agents.

## Core Commands & Local Environment
- **Start All Services:** `./scripts/start_all.sh [--seed | --seed=<key[,key]|listing|all>]` (Docker: Postgres 5433, Redis 6379, Kafka 9092; then backend and frontend).
- **Backend:** `mvn spring-boot:run` | Tests: `mvn test -Dmaven.test.skip=false -Dtest=<Class>` (Mockito only, no Spring context).
- **Frontend:** `cd secondhand-frontend && npm run dev` | `npm run build` | `npm run lint`.
- **Docs & Endpoint Drift:** `python3 scripts/check_docs.py` (0 issues mandatory) | `python3 scripts/check_api_endpoints.py`.

## Operational Agent Skills (`.agents/skills/`)
Local operational skills (symlinked in `.claude/skills`). Activate the relevant skill before modifying code:
- **`transactional-outbox-and-redis-concurrency`**: Money/stock flows (`checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`, `campaign`, `offer`, `cart`, `inventory`), Transactional Outbox + Kafka idempotency (`processed_kafka_events`), Redis Lua reservations, TTL locks, cache eviction.
- **`polymorphic-catalog-and-layered-api`**: Layered API (`controller -> service -> validator/policy -> repository -> mapper`), `ResultResponses`, `@PublicEndpoint`, `@PreAuthorize`, IDOR, Flyway DDL rules, 6-vertical polymorphic catalog, and JSON seeding.
- **`catalog-vertical-playbook`**: Adding/deepening listing verticals: report & approval, Flyway, deterministic seeds with `source`, type rules validator, attributes, snapshotter, `/api/v1/catalog/*`, rule-driven forms.
- **`backend-review-audit`**: Backend audits and fixes by finding ID (GV/VT/PF/DB/SD/KK, P0-P3), verification rules, phased fix commits.
- **`docs-drift-audit`**: Docs audits: `python3 scripts/check_docs.py` (map, links, class names, forced Turkish, stale tooling) and Redis key/TTL drift checks.
- **`restrained-ui-design-standard`**: Apple/Spotify-tier UI design: zero emoji, neutral surfaces, `rounded-md` radius ceiling, `theme.js` semantic tokens, 4-state data discipline, pre-completion regex/lint checks.
- **`frontend-modular-architecture`**: 6-section module architecture, React Router 7 routes, component hierarchy, React Query 5 invalidation matrix, form validation, error unwrapping.
- **`error-handling-and-frontend-contract`**: Dual-track error payload (`ProblemDetail` + `ResultResponses`), `ErrorCode` enum discipline, HTTP status resolution, `errorUtils.getErrorMessage`.

## Stack Discipline & Architecture Guidelines

### Backend (Spring Boot 3.5, Java 17)
- **Layered Flow:** `controller -> service -> validator/policy -> repository -> mapper`. Controllers never hold business logic or return raw entities.
- **Review Checklist:** Entity leaked? Rollback broken? N+1 query or missing pagination? Main transaction broken by async event listener? Missing cache eviction, `@PreAuthorize` or ownership check?
- **Flyway Migrations:** `src/main/resources/db/migration/V<N>__*.sql`. Never modify existing migrations.

### Frontend (React 19, Vite 5, Tailwind 3)
- **Data Flow:** React Query 5 (`useQuery`/`useMutation`) only; server data is never duplicated in local React state. Mutations must explicitly invalidate affected query keys.
- **Shared Primitives:** UI in `src/common/components/ui/` (`Button`, `Modal`, `Skeleton`, `EmptyState`, `Alert`, `DataPagination`); forms in `common/components/forms/` (`inputStyles.js`, `FormPrimitives.jsx`).
- **4 Data States:** Every view must handle: Loading (Skeleton), Empty (EmptyState), Error (Alert), Submitting (Disabled).
- **Security & Network:** Cookies (`HttpOnly`, `SameSite`) for tokens; Axios wrapper `src/common/services/api/request.js`; interceptor 401 mutex refresh queue. No JWT in `localStorage`. Clean up STOMP/WebSocket in `useEffect`.

## Working Rules & Token Economy
- **Load Minimum Context (Save Tokens):** Start from the symptom and trace the execution path. Read only the specific files involved. Use targeted grep/symbol lookups instead of reading full directories. Don't read `docs/` "just in case".
- **Minimal Diffs:** One change solves one problem. Keep diffs strictly inside the affected call chain. Do not refactor unrelated working code.
- **High-Risk Domain Discipline:** Money (`checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`) & Stock (`inventory`, `cart`) = High Risk. No guessed behavior, no silent fallbacks. Fail fast with clear error codes.
- **Money Fix Test Requirement:** Any money/stock fix must ship with a unit test that fails without the fix.
- **Facts Over Guesses:** Verify findings in code before reporting. Clearly distinguish verified facts from hypotheses.
- **Docs Language:** `docs/` is Turkish prose with English technical terms (cache, handshake, provider, consumer); module READMEs and code are English.

## Project Map & Risk Tiers
| Group | Modules | Risk |
|---|---|---|
| Money | `checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`, `campaign`, `offer` | High |
| Identity | `auth`, `user`, `core/jwt`, `core/security` | High |
| Stock | `inventory`, `cart` | High |
| Product | `listing`, `showcase`, `favorite`, `favoritelist`, `review`, `follow`, `forum`, `complaint` | Medium |
| Comms | `chat`, `notification`, `email` | Medium |
| AI / external | `ai`, `cloudinary`, `exchange`, `shipping` | Medium |
| Other | `agreements`, `dashboard`, `core` (config, outbox, idempotency, audit, result, seed, verification) | Low |

Key flow: `checkout` -> `order` -> `payment` -> `escrow` -> seller `ewallet`; stock is atomically reserved in Redis (15m TTL), then deducted in PostgreSQL via Kafka events.

## Where to Look (On Demand)
- Module business rules: `src/main/java/com/serhat/secondhand/<module>/README.md`; frontend: `secondhand-frontend/src/<module>/README.md`.
- Backend task how-tos: `src/main/java/com/serhat/secondhand/<module>/.docs/runbooks/` and `listing/.docs/knowledge/`.
- Architecture deep dives: `docs/README.md` (payments, pricing/coupons/campaigns, escrow, orders, stock, Redis/Kafka, cache, auth, offers, chat, notifications, email, catalog, seeding, Aura AI, CI/CD).
- Docs drift check: `python3 scripts/check_docs.py` (must report 0 issues after doc changes).
- API endpoint parity check: `python3 scripts/check_api_endpoints.py` (currently flags `/v1/ai/summary/{param}/{param}`, a false positive: the backend serves `/user/{id}` and `/listing/{id}`).
