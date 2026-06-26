---
name: Token Saver
description: Triggered when the context window grows or a broad search is performed.
triggers:
  - "token save"
---

# Token Saver

## Trigger
Triggered by "token save" or when extensive file scanning is noticed.

## Workflow Steps
1. Read the local `README.md` first — do not jump to source code.
2. Only scan the relevant folder, do not browse the whole repo.
3. Stop searching immediately when the answer is found.
4. Do not open new files if the context is sufficient.

## Rules
- Do not read the same information from two sources.
- Do not pull test or config files into context unless necessary.
