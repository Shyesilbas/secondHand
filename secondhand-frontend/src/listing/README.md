# Listing UI Module

## Purpose
The `listing` UI module handles the presentation of the main item catalog, including dynamic filtering, grid rendering, pagination, and multi-mode searching.

## Architecture Overview
- **useListingEngine:** Central orchestration hook linking filters, searches, and fetching logic.
- **useListingSearch:** Manages search request orchestration and aborts stale requests.
- **ListingService:** Handles the complex serialization of filter states before API transmission.

## Business Invariants & Constraints
- **Card Render Optimization:** `ListingCard` components use strict memoization comparators to prevent unnecessary re-renders in large grids. Global computations (like active showcase checks) should be performed by the grid and passed down as simple props.
- **Filter Serialization:** UI filter states must be precisely serialized into backend-compatible payloads, avoiding invalid defaults (like coercing undefined to 0).
- **Search Robustness:** The search mechanism relies on `request-id` tracking to ensure older searches do not overwrite new search results on the screen.

## Integration Points
- **Incoming:** Main catalog routes.
- **Outgoing:** Queries the backend `listing` APIs heavily.

## Knowledge Routing
- For procedural changes or troubleshooting, refer to KIs in `src/.docs/listing/`.

## Source of Truth
- **Business Rules:** Domain READMEs
- **UI Rules:** Frontend UX KIs (`src/.docs/`)
- **React Query:** `react-query-ownership.md`
- **API:** Backend OpenAPI & Tests
- **Validated Behaviour:** Unit Tests
- **Architecture:** `GEMINI.md`
