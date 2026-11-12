# secondHand — Unified Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL 15, Redis 7, Kafka 3.7) and React 19 frontend (`secondhand-frontend/`). This file is the single canonical source of truth for all AI agents. Detailed domain rules live in module `README.md` files; detailed tasks live in `.agents/skills/`.

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

## Mandatory Architecture & Code Invariants
- **Zero Emoji Standard:** Absolutely zero emojis in code, comments, UI text, buttons, alerts, status pills, or git commits. Use `lucide-react` icons for UI indicators.
- **Backend Flow:** Strict layered flow (`controller -> service -> validator/policy -> repository -> mapper`). Controllers never contain business logic or leak raw JPA entities. Flyway migrations (`src/main/resources/db/migration/V<N>__*.sql`) are strictly immutable; never edit existing migrations.
- **Frontend State & Security:** React Query 5 only (`useQuery`/`useMutation`); server state is never duplicated into local React state. Session tokens must live in `HttpOnly`, `SameSite` cookies; never in `localStorage`.
- **High-Risk Domain Discipline:** Money (`checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`) & Stock (`inventory`, `cart`) = High Risk. No guessed behavior, no silent fallbacks. Fail fast with clear error codes. Any money/stock fix must ship with a unit test that fails without the fix.
- **Docs Language:** `docs/` is Turkish prose with English technical terms (cache, handshake, provider, consumer); module READMEs and code are English.

## Token & Context Economy Rules (Strict for Agents)
- **Ignore Vendor & Build Artifacts:** Never scan, search, or read files in `node_modules/`, `dist/`, `.vite/`, `.turbo/`, `target/`, `.mvn/`, `.idea/`, `.vscode/`, or `.git/`.
- **Data Inspection Economy (Head-First):** When inspecting large files, seed JSONs, SQL dumps, or logs, NEVER read or dump the full file. Use `head -n 5` / `head -n 20`, targeted `grep -m 5`, line-limited queries, or specific JSON keys.
- **Load Minimum Context:** Start from the symptom and trace the execution path. Read only the specific files involved. Consult module `README.md` files on demand; do not read architecture docs "just in case".
- **Minimal Diffs:** One change solves one problem. Keep diffs strictly inside the affected call chain. Do not refactor unrelated working code.
- **Facts Over Guesses:** Verify findings in code before reporting. Clearly distinguish verified facts from hypotheses.

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
- **Module Business Rules & Hubs:** `src/main/java/com/serhat/secondhand/<module>/README.md`; frontend: `secondhand-frontend/src/<module>/README.md`. Every module README is a self-contained domain hub directly cross-linking its task runbooks (`.docs/runbooks/`), corresponding `docs/*.md` architecture deep dives, and frontend counterpart views.
- **Backend Task How-Tos:** Direct links inside module READMEs or inspect `<module>/.docs/runbooks/` and `listing/.docs/knowledge/`.
- **Architecture Deep Dives:** Direct links inside module READMEs or cross-cutting index in `docs/README.md`.
- Docs drift check: `python3 scripts/check_docs.py` (must report 0 issues after doc changes).
- API endpoint parity check: `python3 scripts/check_api_endpoints.py` (currently flags `/v1/ai/summary/{param}/{param}`, a false positive: the backend serves `/user/{id}` and `/listing/{id}`).
