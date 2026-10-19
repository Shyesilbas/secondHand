# AI (Aura) UI Module

User interface for the platform's Aura AI assistant, conversational search, memory profile hub, price advisor gauge, and floating widget.

## Architecture
- `useAuraChat`: Core hook orchestrating query dispatches to `/api/v1/ai/agents/query`, message histories, and data source tracking.
- `AuraChatWidget`: Floating conversational panel accessible across all browsing screens.
- `AuraChatPage`: Dedicated full-screen assistant workstation with memory preferences and search planning visualization.
- `AuraSuggestedListingChips`: Displays structured product cards returned directly by the AI search orchestrator.
- `AuraPriceAdvisorGauge`: Visual gauge reflecting fair market price recommendations for listings.

## Invariants
- **UI Context Injection:** Every message dispatches `uiContext` containing the current pathname, active `listingId`, and filter query parameters to enable contextual answers.
- **Restrained Styling:** Strict compliance with `DESIGN.md`: no neon glowing bubbles or looping animations; messages use neutral surfaces and clean hairline dividers.
- **Graceful Fallback:** If the AI backend is rate-limited or unavailable, the UI falls back to standard keyword catalog search without breaking view state.
