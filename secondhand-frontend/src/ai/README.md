# AI (Aura) UI Module

User interface for the platform's Aura AI assistant, conversational search, memory profile hub, price advisor gauge, and floating widget.

## Architecture
- `useAuraChat`: Core hook orchestrating query dispatches to `/api/v1/ai/agents/query`, message histories, and data source tracking.
- `AuraChatWidget`: Floating conversational panel accessible across all browsing screens.
- `AuraChatPage`: Full-screen single-column chat; optional listing context bar (from `location.state.listing` / `listingId`), memory modal, and today's remaining Aura questions from `usePlan`.
- `AuraSuggestedListingChips`: Displays structured product cards returned directly by the AI search orchestrator.
- `AuraPriceAdvisorGauge`: Visual gauge reflecting fair market price recommendations for listings.

## Invariants
- **UI Context Injection:** Every message dispatches `uiContext` containing the current pathname, active `listingId`, and filter query parameters to enable contextual answers.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: no neon glowing bubbles or looping animations; messages use neutral surfaces and clean hairline dividers.
- **One request per question:** `sendAuraRequest` never retries an agent call on `/v1/ai/chats`; a timed-out agent call may still be answered and counted server-side. A `403 AURA_LIMIT_EXCEEDED` opens the premium modal, and every send invalidates `['membership','status']` so the remaining quota stays current.
