---
name: Documentation Sync
description: Triggered when an artifact, README, or GEMINI.md needs to be updated due to code changes.
triggers:
  - "documentation sync"
---

# Documentation Sync

## Trigger
Triggered by "documentation sync".

## Workflow Steps
1. Identify what code changed.
2. Update local domain `README.md` for business logic changes.
3. Update `.agents/decisions/` files if architecture changed.
4. Update `.agents/TASKS.md` if the active state changed.
5. Only update the affected section, do not touch the rest.
6. Delete any conflicting old text (stale data) after the update.

## Rules
- Keep it short: a section should be maximum 5-8 lines.
- Do not repeat: the same information should not be copied across multiple documents.
