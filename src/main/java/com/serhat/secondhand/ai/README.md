# AI (Aura) Domain

Orchestrates the Aura conversational assistant (Google Gemini), semantic multi-vertical listing search (`AuraListingSearchOrchestrator`), context-aware price advice (`<PriceAdvisorGauge>`), persistent user preference memory (`MemoryService`), and seller/listing review summaries (`AiSummaryService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/aura-ai-and-context-architecture.md`](/docs/aura-ai-and-context-architecture.md) (search planning, context adapters, price gauge, quota mechanics)
> - **Complaint moderation:** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](/docs/proposals/aura-trust-safety-and-complaint-moderation.md) — uses `GeminiClient.generateStrictJson` (one call, response schema, optional inline images, 15 s timeout, throws instead of returning placeholder text).
> - **Frontend Module:** [`secondhand-frontend/src/ai/README.md`](/secondhand-frontend/src/ai/README.md)
> - **Key Entry Points:** [`AgentController`](agent/api/AgentController.java) · [`AgentQueryService`](agent/query/AgentQueryService.java) · [`AuraListingSearchOrchestrator`](agent/search/AuraListingSearchOrchestrator.java) · [`AiSummaryController`](api/AiSummaryController.java) · [`AiSummaryService`](application/AiSummaryService.java) · [`AiChatController`](api/AiChatController.java) · [`GeminiClient`](application/GeminiClient.java) · [`GlobalGeminiBudgetGuard`](application/GlobalGeminiBudgetGuard.java) · [`MemoryService`](memory/service/MemoryService.java) · [`MemoryConversationService`](memory/service/MemoryConversationService.java)

## Business Rules & Invariants
- **Daily Plan Quotas & Quota-Before-Search (`GeminiAiService`, `AgentQueryService`):** `MembershipPlan.FREE` (2/day) and `MembershipPlan.PREMIUM` (8/day), enforced via `UserRepository.reserveAuraSlot` (`acc_status = 'ACTIVE'`, throws `AURA_LIMIT_EXCEEDED` on HTTP 403). `AgentQueryService.executeQuery` reserves the slot before running `AuraListingSearchOrchestrator` LLM planning; failed calls release the slot.
- **Global AI Spend Guard & Upstream Auth (`GlobalGeminiBudgetGuard`, `GeminiClient`):** All Gemini calls pass the API key via `x-goog-api-key` header (never query string), set explicit `maxOutputTokens` (`gemini.api.max-output-tokens`, `gemini.api.memory-max-output-tokens`), and consume `gemini.api.daily-global-limit` atomically in Redis (fail-closed -> `AI_DAILY_BUDGET_EXCEEDED`).
- **Search Planning & Rate Limiting (`AuraListingSearchOrchestrator`, `AuraAgentSearchRateLimiter`):** Simple greetings matching `BYPASS_SEARCH_INTENT` skip LLM search planning. Search queries pass Redis per-user throttling (`aura.agent.search.rate-limit-per-minute`), extract a JSON `SearchPlan` (with `alternativeQueries` such as abbreviations), and query `ListingSearchService`: all-words `globalSearch` per phrasing first, then `globalSearchBestMatch` (one word may be missing).
- **Context Isolation & Prompt Fences (`PromptSanitizer`, `AgentPromptBuilder`):** Context adapters inject only `currentUser.getId()` data. Untrusted inputs (user messages, memory fields, reviews, context) are escaped and bounded inside `<untrusted_evidence>` tags.
- **Review Summaries (`AiSummaryService`, `@PublicEndpoint`):** Cached in Redis (`ai:summaries`); uncached generation skips 0-review entities, enforces per-IP hourly window (`ai.summary.ip-hourly-limit`), and sets a negative-cache cooldown (`ai.summary.negative-cache-seconds`) on failures.
- **Memory Updates (`MemoryService`):** `updateMemory` and `removeInterest` persist bounded fields directly without triggering synchronous LLM calls.

## Redis
- `v4:ai:budget:daily:` — platform-wide daily Gemini call counter (`GlobalGeminiBudgetGuard`).
- `v4:rate_limit:aura_search:user:` — per-user Aura search window counter (`AuraAgentSearchRateLimiter`).
- `v4:ai:summary:ip:` / `v4:ai:summary:cooldown:` — per-IP summary quota and failure cooldown (`AiSummaryService`).
- `ai:summaries` — cached listing and user review summaries (`CacheConfig`); after a `ReviewCreatedEvent` commits, `AiSummaryCacheInvalidationListener` drops the seller's and listing's entry only on the first review or after `ai.summary.refresh-after-new-reviews` new ones (counter `v4:ai:summary:new_reviews:*`), so a review does not cost a Gemini call each time.

## API
- **Agent & Chat (`/api/v1/ai`):** `POST /agents/query` (`AgentController`, `AgentQueryResponse`) · `POST /chats` · `POST /chats/new` · `DELETE /chats/history` (`AiChatController`).
- **Memory (`/api/v1/ai/memories`):** `GET /` · `PUT /` · `DELETE /` (`UserMemoryDto`).
- **Summaries (`AiSummaryController`, `/api/v1/ai/summary`, `@PublicEndpoint`):** `GET /user/{user-id}` · `GET /listing/{listing-id}`.
