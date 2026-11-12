# AI (Aura) UI Module

Conversational marketplace shopping assistant, autonomous catalog search, memory profile governance, fair-price advisor gauge, and floating conversational widget.

---

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`ai`](../../../src/main/java/com/serhat/secondhand/ai/README.md)
> - **Architecture Deep Dive:** [`docs/aura-ai-and-context-architecture.md`](../../../docs/aura-ai-and-context-architecture.md)
> - **Architecture Deep Dive:** [`docs/aura-trust-safety-and-complaint-moderation-architecture.md`](../../../docs/aura-trust-safety-and-complaint-moderation-architecture.md)

## 1. Overview & Purpose

The `ai` module houses the frontend interfaces for **Aura AI (Gemini 2.5 Pro / Flash)**, the platform's intelligent assistant. Aura assists buyers and sellers with discovery, deal evaluation, and transaction guidance:
1. **Conversational Search & Recommendations:** Full chat view (`AuraChatPage`) and floating global assistant (`AuraChatWidget`) that interpret natural language buyer intents and return contextual advice and product suggestions.
2. **Context-Aware Ingestion:** Automatically injects `uiContext` (active listing, current URL route, applied catalog filters) into agent queries so recommendations reflect current page context.
3. **Suggested Listing Chips:** Rich interactive listing cards (`AuraSuggestedListingChips`) rendered directly inline within the conversational transcript.
4. **Price Advisor Gauge:** Visual fair-market value meter (`AuraPriceAdvisorGauge`) rendering price valuation confidence intervals on listing details.
5. **Memory Profile Governance:** User controls (`AuraMemoryProfileHub`) to inspect, edit, or purge AI-retained preferences and shopping habits.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/aura` (or `/ai/chat`) | Public / Protected | `AuraChatPage` | Full-screen conversational AI workspace; receives `listingId` via location state for contextual product inquiries. |
| Global Overlay | Public / Protected | `AuraChatWidget` | Floating bottom-right chat launcher accessible across all browsing pages. |
| Embedded Element | Public | `AuraPriceAdvisorGauge` | Embedded on `/listings/:id` to render algorithmic fair-price guidance. |
| In-Modal / Embedded | `ProtectedRoute` | `AuraMemoryProfileHub` | Profile management dialog for viewing and deleting Aura's personalization memories. |

---

## 3. Component Hierarchy & Core Sub-Components

```
ai/
├── pages/
│   └── AuraChatPage.jsx               # Dedicated single-column chat view with context banner
├── components/
│   ├── AuraChatWidget.jsx             # Collapsible floating assistant drawer
│   ├── AuraMessageContent.jsx         # Markdown, system callout, and tool result formatter
│   ├── AuraSuggestedListingChips.jsx  # Interactive product recommendation cards
│   ├── AuraPriceAdvisorGauge.jsx      # Fair price meter with confidence interval ticks
│   └── AuraMemoryProfileHub.jsx       # Personalization memory inspector and deletion dialog
├── hooks/
│   └── useAuraChat.js                 # Chat session state, message dispatch, and quota checks
├── services/
│   └── aiChatService.js               # REST client for /api/v1/ai/chats and agent queries
├── config/
│   └── agentConfig.js                 # Aura persona prompts, default chips, and limits
├── utils/
│   ├── auraChatUtils.js               # Message formatting and transcript normalizers
│   ├── auraListingContext.js          # Ingests listing spec snapshots for context injection
│   └── auraWidgetContext.js           # Extracts route and filter parameters for agent payloads
└── index.js                           # Module exports
```

### Component Roles & Invariants
- **UI Context Injection:** Every message dispatches `uiContext` containing the current pathname, active `listingId`, and filter query parameters to enable contextual answers.
- **One Request Per Question (No Retries):** `sendAuraRequest` never retries an agent call on `/v1/ai/chats`; a timed-out agent call may still be answered and counted server-side.
- **Quota Tracking & Invalidation:** Every sent message invalidates `['membership', 'status']` so remaining daily questions stay synchronized.
- **Quota Limit Gate:** Receiving a `403 AURA_LIMIT_EXCEEDED` response immediately halts chat input and triggers the premium membership upgrade modal.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['ai', 'chats', chatId]` | Active conversation transcript | 0 sec (realtime) | 10 min (`600000ms`) | User or assistant message added |
| `['ai', 'memory', userId]` | Stored user preferences and habits | 5 min (`300000ms`) | 15 min (`900000ms`) | Memory deletion in `AuraMemoryProfileHub` |
| `['ai', 'priceAdvisor', listingId]` | Fair-market valuation estimate | 10 min (`600000ms`) | 30 min (`1800000ms`) | Listing price update |
| `['membership', 'status']` | Daily remaining Aura question quota | 30 sec (`30000ms`) | 5 min (`300000ms`) | Dispatched message via `useAuraChat` |

### Hooks Contract
- `useAuraChat(options)`: Exposes `{ messages, sendMessage, isLoading, isStreaming, clearHistory, error, remainingQuota }`.

---

## 5. Form & Data Validation Rules

- **Prompt Input:** Minimum 2 characters, maximum 1,000 characters. Trimmed on dispatch.
- **Context Payload:** Serialized `uiContext` object containing:
  - `currentPath`: Window pathname (e.g., `/listings/electronics/123`).
  - `activeListingId`: Optional UUID of product currently under inspection.
  - `activeFilters`: Current search filters (minPrice, maxPrice, condition).

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Assistant bubble displays an animated three-dot pulsing indicator (`Thinking...`) while waiting for agent token streaming.
2. **Empty State:** Clean introduction screen featuring welcome message, predefined prompt suggestion chips, and remaining daily question badge.
3. **Error State:** Surfaces inline retry banner if the AI orchestrator is unreachable or times out.
4. **Data State:** Ordered conversational transcript with user query bubbles, assistant response bubbles, inline Markdown code blocks, and product recommendation cards.

### Backend Error Contract
- **`AURA_LIMIT_EXCEEDED`:** Indicates user has exhausted free daily queries. Displays membership plan upgrade card.
- **`AURA_UNAVAILABLE`:** Temporary model downtime; prompts user to try again in a few moments.
- **`CONTENT_POLICY_VIOLATION`:** Displays Trust & Safety warning if prompt violates marketplace acceptable use policy.

### Restrained Design Tokens
- **Message Bubbles:**
  - User: `bg-primary text-primary-foreground rounded-lg rounded-tr-sm`.
  - Assistant: `bg-surface-alt text-foreground border border-border rounded-lg rounded-tl-sm`.
- **Price Advisor Gauge:** Restrained 3-zone color bar (green for fair price, amber for moderate, slate for high) with hairline marker; zero glowing rainbow animations.
- **Radii:** Standard `rounded-md` on widget window and cards.
