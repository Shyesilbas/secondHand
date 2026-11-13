# Showcase UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`showcase`](../../../src/main/java/com/serhat/secondhand/showcase/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Executive Summary & Architecture
The `showcase` module governs paid listing promotions ("vitrin"). It enables sellers to boost listing visibility on the homepage and discovery feeds, calculate daily fees with applicable taxes, manage active promotion durations, and purchase extensions using eWallet funds.

### Key Architectural Responsibilities
- **Promotional Tier Configuration:** Fetches daily costs and duration limits via `/api/v1/showcases/pricing-config`.
- **Duration Selection Dialog (`ShowcaseModal`):** Captures promotion days, computes total cost, checks seller plan showcase slot limits, and executes payment.
- **Active Boost Management (`MyShowcasesPanel`):** Displays active showcase items, expiration dates, extension triggers, and cancellation options.
- **Dedicated Hooks:** `useShowcase` coordinates pricing and purchases; `useMyShowcases` caches active promotions.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `SHOWCASE_QUERY_KEYS.active(page, size)` | `queries.js` |
| `['myShowcases', userId]` | `useMyShowcases.js` |

| Invalidated / updated key | By |
|---|---|
| `SHOWCASE_QUERY_KEYS.active()` | `useShowcase.js` |
| `SHOWCASE_QUERY_KEYS.all` | `useShowcase.js` |
| `['listings']` | `ShowcaseModal.jsx` |
| `['myShowcases', userId]` | `useMyShowcases.js` |
| `['myShowcases']` | `ShowcaseModal.jsx` |
| `['showcases']` | `ShowcaseModal.jsx`, `useMyShowcases.js` |

## 3. Pricing Math & Invariants

1. **Daily Fee Formula:**
   $$\text{Total Fee} = \text{dailyCost} \times (1 + \text{taxRate}) \times \text{days}$$
2. **Wallet Balance Prerequisite:** If `ewallet.balance < totalCost`, the purchase button transforms into a "Top Up eWallet" redirect.
3. **Cancellation Policy:** Cancelling a showcase early removes it from public feeds but does not issue an automated refund.
