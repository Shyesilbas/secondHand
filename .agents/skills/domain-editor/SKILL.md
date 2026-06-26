---
name: Domain Editor
description: Triggered when business rules, validations, or service logic change.
triggers:
  - "domain rule"
---

# Domain Editor

## Trigger
Triggered by "domain rule".

## Zero-I/O Architectural Rules
- **Layered Flow:** Business rules stay in service/validator. Controllers must remain thin.
- **DTO Usage:** Always use DTOs for request and response payloads. Never expose Domain/Entity models directly.
- **High-Risk Domains (Payment, Escrow, Order):** Do not make assumptions. Generate clear errors, do not write fallbacks. Escrow and EWallet operations must be under `@Transactional` with clear rollback mechanisms.

## Workflow Steps
1. Determine the domain (payment, order, listing, escrow, cart, offer).
2. Read the local README of that domain.
3. Determine the affected chain: validator → service → repository.
4. Only touch that chain, do not go outside of it.
5. Check DTO and mapper consistency.
6. One change should solve one problem.
