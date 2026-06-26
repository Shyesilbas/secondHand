# Cart Domain

## Purpose
The `cart` domain manages the user's shopping cart, handling addition, modification, and deletion of items, as well as executing temporary reservations for low-stock scenarios.

## Architecture Overview
- **CartService:** Core business logic handling stock availability, reservation calculations, and cart mutations.
- **CartValidator:** Extracts listing and reservation eligibility checks out of the service layer.
- **CartReservationScheduler:** A periodic cleanup task that purges expired low-stock reservations from the database.

## Business Invariants & Constraints
- **Ownership Limitation:** Users cannot add their own listings to their cart.
- **Listing Status:** Items added to the cart must be in an `ACTIVE` state.
- **Reservation Stock:** When checking available stock, active cart reservations belonging to other users must be subtracted from the total available quantity.
- **Parallel Mutations:** Concurrent additions or updates that trigger DB unique constraint conflicts are intercepted and converted into standard business errors, not technical 500s.

## State Machines
- **Reservation Status:** `null` -> `reservedAt/reservationEndTime` assigned -> Cleared when expired by the Scheduler or processed in Checkout.

## Integration Points
- **Incoming:** User actions via `CartController`.
- **Outgoing:** Validates listing state via the `listing` domain query APIs. Provides items to the `checkout` domain.

## Public APIs
- `GET /api/cart`
- `POST /api/cart/add`, `PUT /api/cart/update`, `DELETE /api/cart/remove`

## Related Knowledge
- **Cart Feature Development**
  -> `.docs/runbooks/cart-feature-runbook.md`
