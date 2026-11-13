# AI (Aura) UI Module

Conversational marketplace shopping assistant, autonomous catalog search, memory profile governance, fair-price advisor gauge, and floating conversational widget.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`ai`](../../../src/main/java/com/serhat/secondhand/ai/README.md)
> - **Architecture Deep Dive:** [`docs/aura-ai-and-context-architecture.md`](../../../docs/aura-ai-and-context-architecture.md)
> - **Proposal (not implemented):** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](../../../docs/proposals/aura-trust-safety-and-complaint-moderation.md)

## 1. Overview & Purpose

The `ai` module houses the frontend interfaces for **Aura AI (Gemini 2.5 Pro / Flash)**, the platform's intelligent assistant. Aura assists buyers and sellers with discovery, deal evaluation, and transaction guidance:
1. **Conversational Search & Recommendations:** Full chat view (`AuraChatPage`) and floating global assistant (`AuraChatWidget`) that interpret natural language buyer intents and return contextual advice and product suggestions.
2. **Context-Aware Ingestion:** Automatically injects `uiContext` (active listing, current URL route, applied catalog filters) into agent queries so recommendations reflect current page context.
3. **Suggested Listing Chips:** Rich interactive listing cards (`AuraSuggestedListingChips`) rendered directly inline within the conversational transcript.
4. **Price Advisor Gauge:** Visual fair-market value meter (`AuraPriceAdvisorGauge`) rendering price valuation confidence intervals on listing details.
5. **Memory Profile Governance:** User controls (`AuraMemoryProfileHub`) to inspect, edit, or purge AI-retained preferences and shopping habits.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/aura` | `AuraChatPage` | Protected |

| Embedded entry | Where |
|---|---|
| `AuraChatWidget` | Floating bottom-right chat launcher accessible across all browsing pages. |
| `AuraPriceAdvisorGauge` | Embedded on `/listings/:id` to render algorithmic fair-price guidance. |
| `AuraMemoryProfileHub` | Profile management dialog for viewing and deleting Aura's personalization memories. |

## 3. Component Rules

- **UI Context Injection:** Every message dispatches `uiContext` containing the current pathname, active `listingId`, and filter query parameters to enable contextual answers.
- **One Request Per Question (No Retries):** `sendAuraRequest` never retries an agent call on `/v1/ai/chats`; a timed-out agent call may still be answered and counted server-side.
- **Quota Tracking & Invalidation:** Every sent message invalidates `['membership', 'status']` so remaining daily questions stay synchronized.
- **Quota Limit Gate:** Receiving a `403 AURA_LIMIT_EXCEEDED` response immediately halts chat input and triggers the premium membership upgrade modal.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['ai', 'memory']` | `AuraMemoryProfileHub.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['ai', 'memory']` | `AuraMemoryProfileHub.jsx` |
| `['membership', 'status']` | `useAuraChat.js` |

## 5. Form & Data Validation Rules

- **Context Payload:** `buildAuraWidgetUiContext` (`auraWidgetContext.js`) sends `uiContext` with `currentPage`, `route`, optional `listingId` (UUID from `/listings/:id`) and `filters` from query params (max 12 entries, keys 64 chars, values 120 chars).
