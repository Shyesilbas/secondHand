# Shipping Domain

## Purpose
The `shipping` domain isolates the logistical tracking and carrier management from the main order processing flow.

## Architecture Overview
- **Modular Separation:** Shipping state transitions are handled independently of payment and checkout.
- **Carrier Management:** Managed via enum structures (`Carrier`) allowing Open/Closed extension.

## Business Invariants & Constraints
- **State Progression:** PENDING -> IN_TRANSIT -> DELIVERED (or CANCELLED).
- **Update Authorization:** Only sellers can update carrier and tracking information for an order they fulfill.

## Integration Points
- **Incoming:** Triggered post-payment by the `order` domain.
- **Outgoing:** Provides delivery status back to `order` and `escrow` to trigger fund releases.

## Public APIs
- `PUT /api/v1/orders/{orderId}/ship`

## Related Knowledge
- *(No specific runbooks extracted; modifications usually require updating Carrier enums and state transitions)*
