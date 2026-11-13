# Campaign UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`campaign`](../../../src/main/java/com/serhat/secondhand/campaign/README.md)
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](../../../docs/pricing-coupon-and-campaign-architecture.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/selling/campaigns` | `SellerCampaignsPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['campaigns', 'my', page, PAGE_SIZE]` | `MyCouponsPage.jsx` |
| `['myListingsForCampaign']` | `CreateCampaignModal.jsx`, `MyCouponsPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `SHOWCASE_QUERY_KEYS.all` | `campaignQueries.js` |
| `['campaigns']` | `campaignQueries.js` |
| `['listings', 'detail']` | `campaignQueries.js` |
| `['listings']` | `campaignQueries.js` |
| `['myListings']` | `campaignQueries.js` |
| `['similarListings']` | `campaignQueries.js` |

## 3. Scope & Validation Rules

Sellers can target campaigns via `CreateCampaignModal`:
1. **Store-Wide:** Applies discount to all current (and optionally future) listings.
2. **Category-Scoped:** Applies discount to listings matching selected listing types.
3. **Item-Specific:** Multi-select picker binding specific listing UUIDs.
- **Constraints:** Minimum discount 5%, maximum discount 90%. End date must be strictly after start date.
