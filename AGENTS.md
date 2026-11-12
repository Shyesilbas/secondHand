# secondHand — Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL, Redis, Kafka) and a React 19 frontend in `secondhand-frontend/`. This file holds cross-cutting rules; detailed domain standards live in `.agents/skills/` and stack-specific guides below.

## Specialized Agent Skills (`.agents/skills/`)
`.agents/` is git-ignored (local only); `.claude/skills` is a symlink to `../.agents/skills`, so Claude Code discovers the same files. Activate the relevant skill before modifying code:
- **`transactional-outbox-and-redis-concurrency`** (`.agents/skills/transactional-outbox-and-redis-concurrency/SKILL.md`): Money and stock flows (`checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`, `campaign`, `offer`, `cart`, `inventory`), Transactional Outbox + Kafka consumer idempotency (`processed_kafka_events`), Redis 7 Lua stock/coupon reservations, TTL locks, and multi-tier Redis cache eviction.
- **`polymorphic-catalog-and-layered-api`** (`.agents/skills/polymorphic-catalog-and-layered-api/SKILL.md`): Layered Spring Boot API (`controller -> service -> validator/policy -> repository -> mapper`), `ResultResponses`, security filter chain (`@PublicEndpoint`, `@PreAuthorize`, IDOR), Flyway migrations, 6-vertical polymorphic catalog, deterministic UUID JSON seeding, and React Query contract.
- **`catalog-vertical-playbook`** (`.agents/skills/catalog-vertical-playbook/SKILL.md`): Step-by-step checklist for adding or deepening a listing vertical's catalog: report and approval first, Flyway, deterministic seeds with `source`, type rules validator, attributes, snapshotter, `/api/v1/catalog/<vertical>` API, rule-driven form, local listing generator.
- **`backend-review-audit`** (`.agents/skills/backend-review-audit/SKILL.md`): Backend audits and fixes by finding ID (GV/VT/PF/DB/SD/KK, P0-P3), verification rules, phased fix commits, and recording `Durum` in the review report.
- **`docs-drift-audit`** (`.agents/skills/docs-drift-audit/SKILL.md`): Docs audits and updates: `python3 scripts/check_docs.py` (map, links, class names, forced Turkish, stale commands) plus manual checks of keys, TTLs, topics and counts against code.
- **`restrained-ui-design-standard`** (`.agents/skills/restrained-ui-design-standard/SKILL.md`): Apple/Spotify-tier frontend UI design rules, semantic tokens, purposeful non-flashy color balance, radius ceiling (`rounded-md`), 4-state data discipline, and mandatory pre-completion regex/lint checks.
- **`error-handling-and-frontend-contract`** (`.agents/skills/error-handling-and-frontend-contract/SKILL.md`): Dual-track error payload compatibility (`ProblemDetail` + `ResultResponses`), `ErrorCode` enum discipline, HTTP status resolution (`ErrorCodeStatuses`), and frontend safe message unwrapping (`errorUtils.getErrorMessage`, Axios interceptors, `errorHandler.js`).
- **`frontend-modular-architecture`** (`.agents/skills/frontend-modular-architecture/SKILL.md`): Comprehensive guide and 6-section specification for secondhand-frontend architecture, React 19 + React Query 5 data flow, component tree hierarchy, 4-state UX discipline, React Router 7 routes, form validation, and restrained design system compliance.
- **`ai-aura-moderation-and-agent-workflows`** (`.agents/skills/ai-aura-moderation-and-agent-workflows/SKILL.md`): Engineering standards for Aura AI (Gemini 2.5 Pro/Flash), agent tool execution, dynamic UI context ingestion, autonomous Trust & Safety moderation, dispute arbitration, tiered sanctions, and zero-retry quota governance.
- **`realtime-chat-and-websocket-lifecycle`** (`.agents/skills/realtime-chat-and-websocket-lifecycle/SKILL.md`): STOMP over SockJS (`/ws`) real-time messaging, room subscriptions (`/topic/chat/{roomId}`), user queues, connection cleanup lifecycle, reconnect backoff, and dual-sync badge updates.
- **`testing-and-verification-playbook`** (`.agents/skills/testing-and-verification-playbook/SKILL.md`): Execution flags (`-Dmaven.test.skip=false`), Mockito unit testing discipline, financial/security fix invariants, local Docker integration test safety, and pre-commit verification gates.

## Sub-Directory Guides
- Backend (`src/`): `src/main/java/com/serhat/secondhand/AGENTS.md`
- Frontend (`secondhand-frontend/`): `secondhand-frontend/AGENTS.md`

## Working Rules
- Start from the symptom and follow the execution path (entry point -> call chain -> dependencies). Source code and tests are the truth; docs describe intent. Don't assume Kafka/Redis/async behavior unless the code on that path shows it.
- Load the minimum context: the source files involved, then the module `README.md` only if business rules are unclear. Don't read docs "just in case".
- Keep diffs minimal; one change solves one problem; stay inside the affected chain.
- High-risk = every module marked High in the Project Map. No guessed behavior and no silent fallbacks; fail with a clear error code. (Pricing preview may drop an invalid coupon; checkout must not: `priceCartForCheckout`.)
- A money-flow fix ships with a unit test that fails without the fix.
- Report findings as facts only after verifying them in code; separate facts, hypotheses and what still needs verification.
- Audit/review requests: answer in chat, don't create report files, ask before applying fixes.
- New feature across the stack: define the API contract first, then backend, then frontend; for larger or high-risk features write a short plan (affected modules, DB/backend/frontend changes, risks, verification) and get approval.
- After code changes update only the affected module README or doc section, delete conflicting old text, don't duplicate content across docs.
- Docs language: `docs/` is Turkish prose with English technical terms (cache, handshake, provider, consumer), no forced Turkish; module READMEs and code are English. Verify counts, Redis keys and TTLs in code before writing them; prefer linking the module README over copying.

## Commands & Local Environment
- Start everything: `./scripts/start_all.sh [--seed | --seed=<key[,key]|listing|all>]` (docker compose: Postgres 5433, Redis 6379, Kafka 9092; then backend and frontend).
- Tests are skipped by default (`maven.test.skip=true` in `pom.xml`): `mvn test -Dmaven.test.skip=false -Dtest=<Class>`. Unit tests use plain Mockito, no Spring context.
- `ConcurrentStockAndPaymentIntegrationTest` runs against the local dev services and leaves the first listing's stock at 1; ask before running it.
- Seeds run only with `--app.seed=<key>` (see `docs/database-migration-and-seeding-guide.md`); `src/main/resources/data/` is git-ignored (local copy required).

## Project Map (`src/main/java/com/serhat/secondhand/`)
| Group | Modules | Risk |
|---|---|---|
| Money | `checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`, `campaign`, `offer` | High |
| Identity | `auth`, `user`, `core/jwt`, `core/security` | High |
| Stock | `inventory`, `cart` | High |
| Product | `listing`, `showcase`, `favorite`, `favoritelist`, `review`, `follow`, `forum`, `complaint` | Medium |
| Comms | `chat`, `notification`, `email` | Medium |
| AI / external | `ai`, `cloudinary`, `exchange`, `shipping` | Medium |
| Other | `agreements`, `dashboard`, `core` (config, outbox, idempotency, audit, result, seed, verification) | Low |

Key flow: `checkout` -> `order` -> `payment` -> `escrow` -> seller `ewallet`; stock is reserved in Redis, then decremented in PostgreSQL via Kafka consumers.

## Where to Look (On Demand)
- Module business rules: `src/main/java/com/serhat/secondhand/<module>/README.md`; frontend: `secondhand-frontend/src/<module>/README.md`.
- Backend task how-tos: `src/main/java/com/serhat/secondhand/<module>/.docs/runbooks/` and `listing/.docs/knowledge/`.
- Architecture deep dives: `docs/README.md` (payments, pricing/coupons/campaigns, escrow, orders, stock, Redis/Kafka, cache, auth, offers, chat, notifications, email, catalog, seeding, Aura AI, CI/CD).
- Docs drift check: `python3 scripts/check_docs.py` (must report 0 issues after doc changes).
- API endpoint parity check: `python3 scripts/check_api_endpoints.py` (currently flags `/v1/ai/summary/{param}/{param}`, a false positive: the backend serves `/user/{id}` and `/listing/{id}`).
