# Campaign UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`campaign`](../../../src/main/java/com/serhat/secondhand/campaign/README.md)
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](../../../docs/pricing-coupon-and-campaign-architecture.md)

## 1. Executive Summary & Route Map
The `campaign` module empowers marketplace sellers to design, launch, edit, and deactivate promotional campaigns across their own listings (store-wide discounts, category specials, or specific item sales).

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/seller/coupons` / `/seller/campaigns` | `MyCouponsPage` | `Protected` | Yes | Seller promotional dashboard, campaign list, creation modal |

---

## 2. Component Hierarchy & File Structure

```
src/campaign/
├── pages/
│   └── MyCouponsPage.jsx               # Seller campaign ledger and actions header
├── components/
│   ├── CampaignCard.jsx                # Campaign summary card (discount rate, dates, affected items)
│   └── CreateCampaignModal.jsx         # Modal dialog configuring campaign scopes and rules
├── campaignQueries.js                  # Centralized cache invalidation helper
├── campaignPresentation.js             # Presentation helpers and discount badge formatters
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['campaigns', 'my', page, pageSize]`: Paginated list of campaigns created by the authenticated seller.
- `['myListingsForCampaign']`: Active listings owned by the seller for selection in `CreateCampaignModal`.

### Invalidation Matrix
Managed centrally via `refreshCampaignAffectedQueries(queryClient)` in `campaignQueries.js`:
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createCampaign` | `POST /api/v1/campaigns` | `['campaigns', 'my']`, `['listings', 'my']`, `['cartItems']` | Reflects discounted prices on listings and active cart |
| `updateCampaign` | `PUT /api/v1/campaigns/{id}` | `['campaigns', 'my']`, `['listings', 'my']`, `['cartItems']` | Updates promotion terms |
| `deleteCampaign` | `DELETE /api/v1/campaigns/{id}` | `['campaigns', 'my']`, `['listings', 'my']`, `['cartItems']` | Removes campaign badge and reverts listing pricing |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `MyCouponsPage` renders `<CardSkeleton>` blocks replicating campaign card layouts.
2. **Empty State:**
   - If the seller has created no campaigns, renders `<EmptyState>` with a tag icon and a "Create Campaign" primary button.
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners for mutation rejections.
4. **Disabled / Submitting State:**
   - "Save Campaign" button shows loading spinner and disables all input fields while submitting.

---

## 5. Scope & Validation Rules

Sellers can target campaigns via `CreateCampaignModal`:
1. **Store-Wide:** Applies discount to all current (and optionally future) listings.
2. **Category-Scoped:** Applies discount to listings matching selected listing types.
3. **Item-Specific:** Multi-select picker binding specific listing UUIDs.
- **Constraints:** Minimum discount 5%, maximum discount 90%. End date must be strictly after start date.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions parsed via `errorUtils.getErrorMessage(err)`:
  - `CAMPAIGN_DATES_INVALID` -> "Campaign end date must be after the start date."
  - `CAMPAIGN_DISCOUNT_OUT_OF_BOUNDS` -> "Discount rate must be between 5% and 90%."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Dates and percentage badges use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across campaign badges, create modal, and empty states.
- **Radius Ceiling:** Cards, modals, and buttons adhere strictly to `rounded-md`.
