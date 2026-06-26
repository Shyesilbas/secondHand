# Frontend Architecture Decisions

*Note: This document is for human readers and historical reference. LLMs should rely on the embedded rules within `frontend-quality` and `api-contract` skills.*

## ADR-001: React Query over Manual Fetching
- **Decision:** Use `react-query` (`useQuery`, `useMutation`) hooks for all data fetching and caching operations instead of `fetch` or `axios` inside `useEffect`.
- **Reason:** Automatically handles loading state, caching, and staleTime management, preventing `useEffect` spaghetti.

## ADR-002: API Response Handling
- **Decision:** Frontend receives direct DTO on success, and `{ error: "CODE", message: "..." }` on error. Double unwrap is prohibited (`response.data`, not `response.data.data`).
- **Reason:** Standardizes API responses and error handling across all endpoints.
