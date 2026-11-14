# secondHand — Unified Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL 15, Redis 7, Kafka 3.7) and React 19 frontend (`secondhand-frontend/`). Single source of truth for all AI agents (`CLAUDE.md`, `GEMINI.md`, `CODEX.md` point here).

## Commands
- **Start all:** `./scripts/start_all.sh [--seed | --seed=<key[,key]|listing|all>]` (Docker: Postgres 5433, Redis 6379, Kafka 9092; then backend and frontend).
- **Backend:** `mvn spring-boot:run` | unit tests: `mvn test [-Dtest=<Class>]` (plain Mockito `*Test`, default) | JaCoCo + tests: `mvn -B verify` | integration tests (needs Docker): `mvn test -Pintegration-tests -Dtest=ConcurrentStockAndPaymentIntegrationTest`.
- **Frontend:** `cd secondhand-frontend && npm run dev | build | lint`.
- **Verify:** `./scripts/verify.sh` = `python3 scripts/check_docs.py` (0 issues after doc changes) + `python3 scripts/check_api_endpoints.py` (0 warnings) + zero-emoji scan + frontend lint.

## Skills (`.agents/skills/`, symlinked as `.claude/skills`)
Load the matching skill before modifying code.

| Touching | Skill |
|---|---|
| Money/stock flows, outbox, Kafka consumers, Redis Lua/locks/cache | `transactional-outbox-and-redis-concurrency` |
| Endpoints, DTOs, validators, security annotations, Flyway, polymorphic listing | `polymorphic-catalog-and-layered-api` |
| Adding or deepening a listing vertical's catalog | `catalog-vertical-playbook` |
| Backend audit or a finding ID (GV/VT/PF/DB/SD/KK) | `backend-review-audit` |
| Any doc, README, runbook, skill or `AGENTS.md` edit | `docs-drift-audit` |
| Frontend UI component, view or style | `restrained-ui-design-standard` |
| Frontend module structure, routes, React Query, forms | `frontend-modular-architecture` |
| Exceptions, `ErrorCode`, error payloads, frontend error display | `error-handling-and-frontend-contract` |

## Invariants
- **Zero emoji** in code, comments, UI text and git commits. Use `lucide-react` icons.
- **Backend flow:** `controller -> service -> validator/policy -> repository -> mapper`. No business logic in controllers, no raw JPA entities in responses. Flyway migrations (`src/main/resources/db/migration/V<N>__*.sql`) are immutable.
- **Frontend:** React Query 5 only; server state never copied into local state. Session tokens in `HttpOnly`, `SameSite` cookies, never `localStorage`.
- **High-risk modules (map below):** no guessed behavior, no silent fallbacks, fail fast with error codes. Every money/stock fix ships with a unit test that fails without the fix.
- **Docs:** `docs/` is Turkish prose with English technical terms; module READMEs, runbooks, skills and code are English. One home per fact: module rules in the module hub, cross-module flows in `docs/`, everything else links. Prefer constant/property names over copied literals.
- **Never read:** `node_modules/`, `dist/`, `.vite/`, `.turbo/`, `target/`, `.mvn/`, `.idea/`, `.vscode/`, `.git/`. For large files (seed JSON, SQL dumps, logs) use `head -n 20` or targeted `grep -m 5`.

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

Key flow: `checkout` -> `order` -> `payment` -> `escrow` -> seller `ewallet`; stock is reserved atomically in Redis (`InventoryRedisReservationService`, 15 min), then deducted in PostgreSQL via Kafka events.

## Where to Look
1. **Module hub first:** `src/main/java/com/serhat/secondhand/<module>/README.md` (frontend: `secondhand-frontend/src/<module>/README.md`): Key Entry Points, rules, Redis/Kafka ownership, API list.
2. **Module extras:** `payment/.docs/runbooks/add-payment-provider.md`, `listing/.docs/knowledge/`, linked from the hub. Change rules otherwise live in the hub.
3. **Cross-module deep dives:** `docs/*.md`, indexed in `docs/README.md`. Open only when the task crosses modules or needs the "why".
