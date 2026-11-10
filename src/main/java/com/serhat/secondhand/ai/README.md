# AI (Aura) Domain

## Purpose
The `ai` domain orchestrates interactions with the "Aura" AI assistant, translating natural language user input into semantic listing searches, dynamic price advice, and automated listing generation.

## Architecture Overview
- **AuraListingSearchOrchestrator:** Extracts structured search plans (`SearchPlan`) via `GeminiClient.generateJsonForMemory` (`responseMimeType: "application/json"`), supporting hybrid category + text + location (`city`, `district`) + spec filters (`minPrice`, `maxPrice`, `minRam`, `minStorage`, `minYear`, `maxYear`, `maxMileage`, `minRoomCount`) and skipping DB search when intent is explicitly `NONE`.
- **ContextAdapters:** Systematically injects the active user's context (`ListingFocusAgentContextAdapter` across all 6 verticals with real DB `marketPriceBenchmark` min/max/avg statistics for `<PriceAdvisorGauge>`, plus enriched `OrderAgentContextAdapter`, `ListingAgentContextAdapter`, and `NotificationAgentContextAdapter`) into the LLM prompt.
- **GeminiClient & GeminiAiService:** Manages the communication layer with the Google Gemini API.
- **MemoryService:** Tracks persistent user interests and multi-turn conversation memory.

## Business Invariants & Constraints
- **Context Security:** Context adapters MUST ensure that a user's prompt is never injected with data belonging to another user.
- **Token Limits:** Large data dumps (like complete order histories) must be aggressively summarized before injection to prevent HTTP 429 or Token Limit errors.
- **Daily Aura Quota:** Only `/api/v1/ai/chats` and `/api/v1/ai/agents/query` count questions (`GeminiAiService.reserveAuraSlot`, one conditional UPDATE before the Gemini call; released if the answer fails). A reached limit is thrown as `403 AURA_LIMIT_EXCEEDED`. The stored counter resets on the next question, so `MembershipStatusDto` reports usage only when `daily_aura_reset_date` is today (`User.getDailyAuraUsageOn`). Summary endpoints do not count.
- **Latency Handling:** AI endpoints are inherently slow; front-end consumers must be prepared for delayed, asynchronous responses.

## Integration Points
- **Incoming:** HTTP search, chat, memory, and advisor requests via `AgentController`, `AiChatController`, and `AiSummaryController`.
- **Outgoing:** External calls to the Google Gemini API.

## Public APIs
- **Agent Query (`/api/v1/ai/agents`):**
  - `POST /api/v1/ai/agents/query`: Core conversational endpoint (powers semantic listing search, price gauge evaluation, and listing generation).
- **Chat & Memory (`/api/v1/ai`):**
  - `POST /api/v1/ai/chats`: Sends a direct chat question.
  - `POST /api/v1/ai/chats/new`: Clears conversation history and begins new conversation.
  - `DELETE /api/v1/ai/chats/history`: Deletes conversation history.
  - `GET /api/v1/ai/memories`: Retrieves user preferences and learned memory interests.
  - `PUT /api/v1/ai/memories`: Updates user memory profile.
  - `DELETE /api/v1/ai/memories`: Clears all memory.
  - `DELETE /api/v1/ai/memories/interests`: Removes a specific interest tag.
- **AI Review Summaries (`/api/v1/ai/summary`):**
  - `GET /api/v1/ai/summary/user/{user-id}`: Generates AI summary of reviews for a seller.
  - `GET /api/v1/ai/summary/listing/{listing-id}`: Generates AI summary of reviews for a listing.
- **Diagnostics (`/api/v1/ai/tests` - Admin only):**
  - `GET /api/v1/ai/tests/gemini/hello`: Basic ping test.
  - `POST /api/v1/ai/tests/ask`: Diagnostic question with context.
  - `GET /api/v1/ai/tests/quick`: Quick test query.
