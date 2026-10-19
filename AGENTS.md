# secondHand — Agent Guide

C2C second-hand marketplace: Spring Boot 3.5 / Java 17 backend (PostgreSQL, Redis, Kafka) and a React 19 frontend in `secondhand-frontend/`. This file holds only cross-cutting rules; stack-specific rules load from the files below.

## Which file applies
- Backend work (`src/`): `src/main/java/com/serhat/secondhand/AGENTS.md` (layers, API, money/events/cache, review checklist).
- Frontend work (`secondhand-frontend/`): `secondhand-frontend/AGENTS.md`, and `secondhand-frontend/DESIGN.md` for any UI change (premium, restrained, no emojis, no colored bubbles).
- Tools normally load the nearest `AGENTS.md` for the directory you work in; if yours did not, open it yourself.

## Working rules
- Start from the symptom and follow the execution path (entry point -> call chain -> dependencies). Source code and tests are the truth; docs describe intent. Don't assume Kafka/Redis/async behavior unless the code on that path shows it.
- Load the minimum context: the source files involved, then the module `README.md` only if business rules are unclear. Don't read docs "just in case".
- Keep diffs minimal; one change solves one problem; stay inside the affected chain.
- High-risk modules: `auth`, `payment`, `escrow`, `ewallet`, `order`, `inventory`. No guessed behavior and no silent fallbacks; fail with a clear error code.
- Report findings as facts only after verifying them in code; separate facts, hypotheses and what still needs verification.
- Audit/review requests: answer in chat, don't create report files, ask before applying fixes.
- New feature across the stack: define the API contract first, then backend, then frontend; for larger or high-risk features write a short plan (affected modules, DB/backend/frontend changes, risks, verification) and get approval.
- After code changes update only the affected module README or doc section, delete conflicting old text, don't duplicate content across docs. Commits follow `.github/git-commit-instructions.md`.

## Project map (`src/main/java/com/serhat/secondhand/`)
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

## Where to look (on demand)
- Module business rules: `src/main/java/com/serhat/secondhand/<module>/README.md`; frontend: `secondhand-frontend/src/<module>/README.md`.
- Backend task how-tos: `<module>/.docs/runbooks/`.
- Architecture deep dives: `docs/README.md` (payments, escrow, stock, Redis/Kafka, auth, cache, offers, social proof).
- Open audit findings: `.agents/BACKEND_AUDIT.md`. API spec: `secondhand-openapi.json`.

## Active work
- Completed: Fixed all 14 findings in `.agents/BACKEND_AUDIT.md` (critical enum deduplication, validators, dynamic catalog seeding, Flyway V21-V23).
- Next: AI streaming endpoint test; scan role-based controllers for missing `@PreAuthorize`; CI/CD pipeline; regenerate a Postman collection from `secondhand-openapi.json`.
- Open risk: Offer card mobile view untested.
