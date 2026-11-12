@AGENTS.md

# OpenAI Codex / ChatGPT Instructions — secondHand

You are assisting with the secondHand project (Spring Boot 3.5 backend + React 19 frontend).
Always strictly follow all architecture rules, operational constraints, and domain standards defined in `AGENTS.md`.

Before modifying or generating code:
1. Consult `AGENTS.md` for the domain risk map (Money/Stock = High risk), working rules, and skill mappings.
2. Load relevant domain skills from `.agents/skills/` (e.g. `transactional-outbox-and-redis-concurrency`, `polymorphic-catalog-and-layered-api`, `restrained-ui-design-standard`, `frontend-modular-architecture`).
3. For backend domains, adhere to invariants in `src/main/java/com/serhat/secondhand/<module>/README.md`.
4. For frontend views, adhere to `secondhand-frontend/AGENTS.md` and the restrained design system.
5. Money and stock flow changes must ship with unit tests that fail without the fix.
6. Verify documentation drift after changes with `python3 scripts/check_docs.py` (must report 0 issues).
