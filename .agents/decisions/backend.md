# Backend Architecture Decisions

*Note: This document is for human readers and historical reference. LLMs should rely on the embedded rules within `backend-audit`, `api-contract`, and `domain-editor` skills.*

## ADR-003: Layered Architecture
- **Decision:** Backend workflow strictly follows `controller -> service -> validator -> repository -> mapper`. Controllers must be thin. All business logic must reside in `@Service` classes.
- **Reason:** Separation of concerns, testability, and maintainability.

## ADR-004: Data Transfer Objects (DTO)
- **Decision:** Always use DTOs for request and response payloads, never expose Domain/Entity models directly to the API layer. Use `jakarta.validation` constraints thoroughly on DTOs.
- **Reason:** Security (prevents over-posting) and decoupling API from database schema.

## ADR-006: Escrow and Payment Transactions
- **Decision:** Escrow and EWallet operations must be under `@Transactional` with clear rollback mechanisms. Escrow state machine governs funds.
- **Reason:** Ensures data consistency and prevents financial loss.
