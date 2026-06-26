---
name: Feature Planner
description: Generates an end-to-end implementation plan for a new feature or change.
triggers:
  - "feature plan"
---

# Feature Planner

## Trigger
Triggered by "feature plan".
If the feature is unclear, ask first: "What do you want to do? Which domain does it affect?"

## Zero-I/O Architectural Rules
- **Backend Flow:** Controllers -> Service -> Validator -> Repository -> Mapper.
- **DTOs:** Always use DTOs.
- **React Query:** Mandatory for all frontend fetches.
- **Escrow/Payment:** Requires `@Transactional` and rollback scenarios.
- **Cache:** L1 Caffeine, L2 Redis. Invalidation must be planned.

## Workflow Steps
### 1. Impact Analysis
Determine affected domains (especially high-risk ones: payment, escrow, auth). Is it a new structure or modifying an existing one?

### 2. Technical Decisions
- **Backend:** New entity/table? Event-driven? Cache impact? Scheduler needed?
- **Frontend:** New page or existing? Modal/inline? React Query key?

### 3. Plan Format
Generate the plan:
- Summary
- Affected Domains
- Technical Decisions
- Open Questions (User Review Required)
- Proposed Changes (Grouped by Backend, Frontend, Database, with specific files and rationale)
- Risk Analysis (Risk Level, Precaution)
- Verification Plan (Automated, Manual)

### 4. High-Risk Execution
- Follow transactional rules for Escrow/Payment.
- Detail transaction and rollback scenarios.
- Define cache invalidation chains.
- Ask for approval before executing.
