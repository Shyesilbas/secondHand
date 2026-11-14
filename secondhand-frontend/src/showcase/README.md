# Showcase UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`showcase`](../../../src/main/java/com/serhat/secondhand/showcase/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Executive Summary & Architecture
The `showcase` module governs paid listing promotions ("vitrin"). It enables sellers to boost listing visibility on the homepage and discovery feeds, calculate daily fees with applicable taxes, manage active promotion durations, and purchase extensions using eWallet funds.

### Key Architectural Responsibilities
- **Promotional Tier Configuration:** Reads daily costs and `maxDays` from `showcasePricingConfig` in `/api/v1/enums/all`.
- **Duration Selection Dialog (`ShowcaseModal`):** Captures promotion days, shows backend quotes from `/api/v1/showcases/quotes` (`useShowcaseQuotes`), checks seller plan showcase slot limits, and executes payment.
- **Active Boost Management (`MyShowcasesPanel`):** Displays active showcase items, expiration dates, extension triggers, and cancellation options.
- **Dedicated Hooks:** `useShowcase` coordinates pricing and purchases; `useMyShowcases` caches active promotions.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `SHOWCASE_QUERY_KEYS.active(page, size)` | `queries.js` |
| `SHOWCASE_QUERY_KEYS.quotes(daysOptions)` | `queries.js` |
| `['myShowcases', userId]` | `useMyShowcases.js` |

| Invalidated / updated key | By |
|---|---|
| `SHOWCASE_QUERY_KEYS.active()` | `useShowcase.js` |
| `SHOWCASE_QUERY_KEYS.all` | `useShowcase.js` |
| `['listings']` | `ShowcaseModal.jsx` |
| `['myShowcases', userId]` | `useMyShowcases.js` |
| `['myShowcases']` | `ShowcaseModal.jsx` |
| `['showcases']` | `ShowcaseModal.jsx`, `useMyShowcases.js` |

## 3. Pricing & Invariants

1. **No client-side math:** subtotal, tax, total, remaining balance and shortfall come from `ShowcaseQuoteDto`; the OTP request sends only `listingId` and `days`.
2. **Wallet Balance Prerequisite:** If the quote's `sufficientBalance` is false, the purchase button transforms into a "Top Up eWallet" redirect.
3. **Cancellation Policy:** Cancelling a showcase early removes it from public feeds but does not issue an automated refund.
