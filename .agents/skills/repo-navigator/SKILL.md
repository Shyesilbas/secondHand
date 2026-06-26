---
name: Repo Navigator
description: Triggered to find which file or module will change.
triggers:
  - "repository navigation"
---

# Repo Navigator

## Trigger
Triggered by "repository navigation".

## Workflow Steps
1. Navigate directly to the relevant module's local folder.
2. Read the local `README.md` for domain-specific context.
3. Extract the list of target files.
4. Specify the scope of change: which layer, which file.

## Output Format
- Target files: `[module]/[layer]/[FileName].java`
- Scope of change: controller / service / validator / repository / mapper
- Side effect risk: specify if there is cache / event / auth / payment.
