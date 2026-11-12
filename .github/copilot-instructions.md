# GitHub Copilot Instructions — secondHand

You are assisting with the secondHand project (Spring Boot 3.5 + React 19).
Always strictly follow all architecture rules, conventions, and constraints defined in [AGENTS.md](../AGENTS.md).

Key guidelines:
- Consult domain rules in `src/main/java/com/serhat/secondhand/<module>/README.md`.
- Consult frontend standards in `secondhand-frontend/AGENTS.md`.
- Use the restrained Apple/Spotify-tier UI design standard (zero emoji, `rounded-md` maximum, semantic theme tokens).
- Money and stock flows require unit tests that fail without the fix and strict transactional outbox guarantees.

