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

---

## 2. Component Hierarchy & File Structure

```
src/showcase/
├── components/
│   ├── ShowcaseButton.jsx              # Action trigger rendered on seller listing cards
│   ├── ShowcaseModal.jsx               # Duration picker, fee calculation, and payment dialog
│   ├── ShowcaseSuccessModal.jsx        # Confirmation modal upon successful showcase activation
│   └── MyShowcasesPanel.jsx            # Management table of active, expired, and cancelled showcases
├── hooks/
│   ├── useShowcase.js                  # Purchase mutation, fee math, duration validator
│   ├── useMyShowcases.js               # React Query hook for seller's own showcases
│   └── queries.js                      # React Query keys and query options
├── services/
│   └── showcaseService.js              # Raw Axios endpoints (/api/v1/showcases/**)
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['showcases', 'pricing-config']`: Daily rates and tax configuration (`/api/v1/showcases/pricing-config`).
- `['showcases', 'my']`: Active and historical showcases owned by the authenticated user.
- `['showcases', 'active', page, size]`: Public homepage showcase carousel feed.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createShowcase` | `POST /api/v1/showcases` | `['showcases', 'my']`, `['showcases', 'active']`, `['listings', 'my']`, `['ewallet']` | Activates vitrin badge and debits wallet |
| `extendShowcase` | `POST /api/v1/showcases/{id}/extend` | `['showcases', 'my']`, `['showcases', 'active']`, `['ewallet']` | Extends end date in UI |
| `cancelShowcase` | `POST /api/v1/showcases/{id}/cancel` | `['showcases', 'my']`, `['showcases', 'active']` | Removes showcase badge immediately |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Displays skeleton blocks for showcase cards and calculation rows inside `ShowcaseModal`.
2. **Empty State:**
   - In `MyShowcasesPanel`, if no active promotions exist, displays an empty state with a rocket icon: "You have no active showcase promotions."
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners for insufficient wallet balance or plan quota limits.
4. **Disabled / Submitting State:**
   - "Activate Showcase" button shows loading spinner and disables duration sliders while mutation is processed.

---

## 5. Pricing Math & Invariants

1. **Daily Fee Formula:**
   $$\text{Total Fee} = \text{dailyCost} \times (1 + \text{taxRate}) \times \text{days}$$
2. **Wallet Balance Prerequisite:** If `ewallet.balance < totalCost`, the purchase button transforms into a "Top Up eWallet" redirect.
3. **Cancellation Policy:** Cancelling a showcase early removes it from public feeds but does not issue an automated refund.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `SHOWCASE_ALREADY_ACTIVE` -> "This listing already has an active showcase promotion."
  - `SHOWCASE_SLOT_LIMIT_EXCEEDED` -> "You have reached the maximum showcase slots allowed by your membership plan."
  - `SHOWCASE_DAYS_INVALID` -> "Please select a duration within the allowed days range."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Daily fees, durations, and end dates use `font-mono tabular-nums`.
- **Badges:** Boosted listings display a clean, neutral "Vitrin" pill (`border border-border-subtle`).
- **No Flashy Animations:** Shimmering, pulsing, or glowing animations are strictly prohibited.
- **Radius Ceiling:** Cards, modals, and duration pills adhere strictly to `rounded-md`.
