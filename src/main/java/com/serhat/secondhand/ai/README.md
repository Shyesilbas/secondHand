# AI (Aura) Domain

Orchestrates the Aura conversational assistant (Google Gemini), semantic multi-vertical listing search (`AuraListingSearchOrchestrator`), context-aware price advice (`<PriceAdvisorGauge>`), persistent user preference memory (`MemoryService`), and seller/listing review summaries (`AiSummaryService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/aura-ai-and-context-architecture.md`](/docs/aura-ai-and-context-architecture.md) (search planning, context adapters, price gauge, quota mechanics)
> - **Proposal (not implemented):** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](/docs/proposals/aura-trust-safety-and-complaint-moderation.md)
> - **Frontend Module:** [`secondhand-frontend/src/ai/README.md`](/secondhand-frontend/src/ai/README.md)
> - **Key Entry Points:** [`AgentController`](agent/api/AgentController.java) · [`AgentQueryService`](agent/query/AgentQueryService.java) · [`AuraListingSearchOrchestrator`](agent/search/AuraListingSearchOrchestrator.java) · [`AiSummaryController`](api/AiSummaryController.java) · [`AiChatController`](api/AiChatController.java) · [`MemoryService`](memory/service/MemoryService.java) · [`MemoryConversationService`](memory/service/MemoryConversationService.java)

## Business Rules & Invariants
- **Search Planning & Rate Limiting (`AuraListingSearchOrchestrator`):** Simple greetings matching `BYPASS_SEARCH_INTENT` skip LLM search planning. Search queries pass through `AuraAgentSearchRateLimiter`, extract a structured JSON `SearchPlan` (`mode`: `SEARCH` / `DIRECT` / `NONE`, `listingType`, location, spec bounds), and execute via `ListingSearchService`.
- **Context Isolation & `<PriceAdvisorGauge>`:** Context adapters (`ListingFocusAgentContextAdapter`, `OrderAgentContextAdapter`, `ListingAgentContextAdapter`, `NotificationAgentContextAdapter`) inject only data owned by `currentUser.getId()` (with payload truncation). On listing detail pages, real DB `marketPriceBenchmark` stats (min/max/avg) back `<PriceAdvisorGauge>` tags. Aura's prompt is strictly read-only (never claims to execute mutations).
- **Daily Plan Quotas (`GeminiAiService.reserveAuraSlot`):** `BASIC` (5/day), `PLUS` (25/day), `PRO` (unlimited). Enforced by an atomic conditional SQL update on `users` (`AURA_LIMIT_EXCEEDED` on 403); if the Gemini call fails, the reserved slot is released. Review summary endpoints (`/api/v1/ai/summary/*`) do not consume user quota.

## API
- **Agent & Chat (`/api/v1/ai`):** `POST /agents/query` (`AgentController`, `AgentQueryResponse`) · `POST /chats` · `POST /chats/new` · `DELETE /chats/history` (`AiChatController`).
- **Memory (`/api/v1/ai/memories`):** `GET /` · `PUT /` · `DELETE /` (`UserMemoryDto`).
- **Summaries (`AiSummaryController`, `/api/v1/ai/summary`, `@PublicEndpoint`):** `GET /user/{user-id}` · `GET /listing/{listing-id}`.
