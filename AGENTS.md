# secondHand — Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL, Redis, Kafka) and a React 19 frontend in `secondhand-frontend/`. This file holds cross-cutting rules; detailed domain standards live in `.agents/skills/` and stack-specific guides below.

## Specialized Agent Skills (`.agents/skills/`)
Activate the relevant skill before modifying code:
- **`transactional-outbox-and-redis-concurrency`** (`.agents/skills/transactional-outbox-and-redis-concurrency/SKILL.md`): Money flows (`checkout`, `order`, `payment`, `escrow`, `ewallet`), Transactional Outbox + Kafka consumer idempotency (`processed_kafka_events`), Redis 7 Lua stock/coupon reservations, TTL locks, and multi-tier Redis cache eviction.
- **`polymorphic-catalog-and-layered-api`** (`.agents/skills/polymorphic-catalog-and-layered-api/SKILL.md`): Layered Spring Boot API (`controller -> service -> validator/policy -> repository -> mapper`), `ResultResponses`, security filter chain (`@PublicEndpoint`, `@PreAuthorize`, IDOR), Flyway migrations, 6-vertical polymorphic catalog, deterministic UUID JSON seeding, and React Query contract.
- **`restrained-ui-design-standard`** (`.agents/skills/restrained-ui-design-standard/SKILL.md`): Apple/Spotify-tier frontend UI design rules, semantic tokens, purposeful non-flashy color balance, radius ceiling (`rounded-md`), 4-state data discipline, and mandatory pre-completion regex/lint checks.

## Sub-Directory Guides
- Backend (`src/`): `src/main/java/com/serhat/secondhand/AGENTS.md`
- Frontend (`secondhand-frontend/`): `secondhand-frontend/AGENTS.md`

## Working Rules
- Start from the symptom and follow the execution path (entry point -> call chain -> dependencies). Source code and tests are the truth; docs describe intent. Don't assume Kafka/Redis/async behavior unless the code on that path shows it.
- Load the minimum context: the source files involved, then the module `README.md` only if business rules are unclear. Don't read docs "just in case".
- Keep diffs minimal; one change solves one problem; stay inside the affected chain.
- High-risk modules: `auth`, `payment`, `escrow`, `ewallet`, `order`, `inventory`. No guessed behavior and no silent fallbacks; fail with a clear error code.
- Report findings as facts only after verifying them in code; separate facts, hypotheses and what still needs verification.
- Audit/review requests: answer in chat, don't create report files, ask before applying fixes.
- New feature across the stack: define the API contract first, then backend, then frontend; for larger or high-risk features write a short plan (affected modules, DB/backend/frontend changes, risks, verification) and get approval.
- After code changes update only the affected module README or doc section, delete conflicting old text, don't duplicate content across docs.

## Project Map (`src/main/java/com/serhat/secondhand/`)
| Group | Modules | Risk |
|---|---|---|
| Money | `checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing` | High |
| Identity | `auth`, `user`, `core/jwt`, `core/security` | High |
| Stock | `inventory`, `cart` | High |
| Product | `listing`, `showcase`, `campaign`, `favorite`, `favoritelist`, `review`, `follow`, `forum`, `complaint` | Medium |
| Comms | `chat`, `notification`, `email`, `offer` | Medium |
| AI / external | `ai`, `cloudinary`, `exchange`, `shipping` | Medium |
| Other | `agreements`, `dashboard`, `core` (config, outbox, idempotency, audit, result) | Low |

Key flow: `checkout` -> `order` -> `payment` -> `escrow` -> seller `ewallet`; stock is reserved in Redis, then decremented in PostgreSQL via Kafka consumers.

## Where to Look (On Demand)
- Module business rules: `src/main/java/com/serhat/secondhand/<module>/README.md`; frontend: `secondhand-frontend/src/<module>/README.md`.
- Backend task how-tos: `src/main/java/com/serhat/secondhand/<module>/.docs/runbooks/` and `listing/.docs/knowledge/`.
- Architecture deep dives: `docs/README.md` (payments, escrow, stock, Redis/Kafka, auth, cache, offers, social proof, Aura AI).
- API endpoint parity check: `python3 scripts/check_api_endpoints.py`.
