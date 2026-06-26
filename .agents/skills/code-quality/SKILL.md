---
name: Code Quality Control
description: Checks whether architectural standards (DTO, Exception, Transaction) are violated after code is written.
triggers:
  - "code quality"
---

# Code Quality Control

## Trigger
Triggered by "code quality".

## Zero-I/O Architectural Rules
- **Layered Architecture:** Controller -> Service -> Validator -> Repository -> Mapper.
- **DTOs:** Controller must never return Entity. All inputs/outputs must be DTOs.
- **Transactions:** Escrow and EWallet operations must be under `@Transactional`.
- **Exceptions:** Use appropriate enums (e.g., AuthErrorCodes) instead of hard-coded error messages.
- **Leak Control:** Business logic in the Service layer must never leak to the Controller layer. Controllers must remain thin.

## Workflow Steps
1. Scan the added or modified codes.
2. Verify against the architectural rules above.
3. Report violations clearly with line number and file path.
4. Do not directly fix violations; report them first and request approval.
