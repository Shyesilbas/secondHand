# Agent Map

## Read Order
1. `README.md` at repo root
2. `.artifacts/behaviour.md`
3. Relevant backend module `README.md`
4. Relevant frontend feature README
5. Only then source files

## Fast Mental Model
- Root README explains product scope.
- `.artifacts/behaviour.md` explains how to work.
- Module README explains local business rules.
- Source code is the final authority.

## Best Practice Checklist
- Prefer the smallest file set that answers the question.
- Update docs when behavior changes.
- Keep module boundaries intact.
- Use existing names, types, and error codes.
- Treat cache, payment, escrow, and auth as high-risk areas.

## When Unsure
- Search the module, not the whole repo.
- Favor existing patterns over new abstractions.
- Stop after you have enough context to change one thing safely.

