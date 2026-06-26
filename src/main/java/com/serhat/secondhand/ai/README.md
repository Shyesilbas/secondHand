# AI (Aura) Domain

## Purpose
The `ai` domain orchestrates interactions with the "Aura" AI assistant, translating natural language user input into semantic listing searches, dynamic price advice, and automated listing generation.

## Architecture Overview
- **AuraListingSearchOrchestrator:** Parses user intents and prepares prompts.
- **ContextAdapters:** Systematically injects the active user's context (e.g., cart state, recent orders) into the LLM prompt.
- **GeminiClient:** Manages the HTTP communication layer with the Google Gemini API.

## Business Invariants & Constraints
- **Context Security:** Context adapters MUST ensure that a user's prompt is never injected with data belonging to another user.
- **Token Limits:** Large data dumps (like complete order histories) must be aggressively summarized before injection to prevent HTTP 429 or Token Limit errors.
- **Latency Handling:** AI endpoints are inherently slow; front-end consumers must be prepared for delayed, asynchronous responses.

## Integration Points
- **Incoming:** HTTP search and advisor requests from the client UI.
- **Outgoing:** External calls to the Gemini API.

## Public APIs
- Aura Semantic Search, Price Advisor, and Listing Generator endpoints.

## Related Knowledge
- *(No specific runbooks extracted; modifications involve prompt engineering and context adapter implementation)*
