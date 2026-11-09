# AI (Aura) Domain

## Purpose
The `ai` domain orchestrates interactions with the "Aura" AI assistant, translating natural language user input into semantic listing searches, dynamic price advice, and automated listing generation.

## Architecture Overview
- **AuraListingSearchOrchestrator:** Extracts structured search plans (`SearchPlan`) via `GeminiClient.generateJsonForMemory` (`responseMimeType: "application/json"`), supporting hybrid category + text + location (`city`, `district`) + spec filters (`minPrice`, `maxPrice`, `minRam`, `minStorage`, `minYear`, `maxYear`, `maxMileage`, `minRoomCount`) and skipping DB search when intent is explicitly `NONE`.
- **ContextAdapters:** Systematically injects the active user's context (`ListingFocusAgentContextAdapter` across all 6 verticals with real DB `marketPriceBenchmark` min/max/avg statistics for `<PriceAdvisorGauge>`, plus enriched `OrderAgentContextAdapter`, `ListingAgentContextAdapter`, and `NotificationAgentContextAdapter`) into the LLM prompt.
- **GeminiClient:** Manages the HTTP communication layer with the Google Gemini API.

## Business Invariants & Constraints
- **Context Security:** Context adapters MUST ensure that a user's prompt is never injected with data belonging to another user.
- **Token Limits:** Large data dumps (like complete order histories) must be aggressively summarized before injection to prevent HTTP 429 or Token Limit errors.
- **Daily Aura Quota:** Only `/api/v1/ai/chats` and `/api/v1/ai/agents/query` count questions (`GeminiAiService.reserveAuraSlot`, one conditional UPDATE before the Gemini call; released if the answer fails). A reached limit is thrown as `403 AURA_LIMIT_EXCEEDED`. The stored counter resets on the next question, so `MembershipStatusDto` reports usage only when `daily_aura_reset_date` is today (`User.getDailyAuraUsageOn`). Summary endpoints do not count.
- **Latency Handling:** AI endpoints are inherently slow; front-end consumers must be prepared for delayed, asynchronous responses.

## Integration Points
- **Incoming:** HTTP search and advisor requests from the client UI.
- **Outgoing:** External calls to the Gemini API.

## Public APIs
- Aura Semantic Search, Price Advisor, and Listing Generator endpoints.
