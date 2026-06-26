# Database & Cache Architecture Decisions

*Note: This document is for human readers. LLMs should rely on the embedded rules within specific Domain READMEs and Skills.*

## ADR-005: Cache Strategy
- **Decision:** Use L1 (Caffeine) for local, fast cache (Enum, static lists) and L2 (Redis) for distributed cache (active listings, pub/sub). Always trigger invalidation on updates.
- **Reason:** High performance and scalability for frequent reads.
