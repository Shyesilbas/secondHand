---
name: Backend Audit
description: Generates an architectural quality report for any backend package, service, or domain.
triggers:
  - "backend audit"
---

# Backend Audit

## Trigger
Triggered by "backend audit".
If the package name is not given, ask: "Which package or domain should I analyze?"

## Zero-I/O Architectural Rules
- **Layered Architecture:** Workflow must follow: `controller -> service -> validator -> repository -> mapper`.
- **Controllers:** Must be thin. All business logic must reside in `@Service` classes.
- **Data Transfer:** Controllers must NEVER return Entity models. Always use DTOs.
- **Transactions:** Escrow and EWallet operations must be under `@Transactional` with clear rollback mechanisms.
- **Caching:** L1 (Caffeine) for static lists. L2 (Redis) for distributed cache. Always trigger invalidation on updates.

## Workflow Steps

### 1. Scan Files
Identify the target package and its classes (Controller, Service, Repository, Validator, Mapper, Event, Aspect). 

### 2. Generate the Report
Save the report as `.agents/[PACKAGE_NAME]_BACKEND_AUDIT.md`:
- General Assessment & Class Map
- Detected Issues (Issue, Class/Layer, Risk, Proposed Solution)
- Layer Analysis & Transaction/Security Risk
- Priority Order

### 3. Checklist Evaluation
Evaluate against the architectural rules above:
- **Layer Violations:** Business logic in Controller? Entity returned directly?
- **Transaction Risk:** Rollback scenarios? `@Transactional` used correctly in Escrow/Payment?
- **Validation:** Rules in Service/Validator? Custom exceptions used?
- **Repository:** N+1 risks? Pagination used?
- **Events:** Main transaction broken? Error states handled?

### 4. Request Approval for Fixes
After generating the report, ask: "The report is ready. Would you like me to apply the fixes?" Do not apply unapproved changes.
