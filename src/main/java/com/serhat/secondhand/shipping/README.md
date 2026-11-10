# Shipping Domain

## Purpose
The `shipping` domain isolates logistical carrier management and cargo tracking integration from the main order processing flow.

## Architecture Overview
- **Modular Separation:** Shipping state transitions are handled independently of payment and checkout.
- **Carrier Management:** Each cargo provider is a `CargoProviderPort` adapter (currently `JetKargoAdapter`). `GET /api/v1/enums/all` lists supported `carriers`.

## Business Invariants & Constraints
- **State Progression:** PENDING -> IN_TRANSIT -> DELIVERED (or CANCELLED).
- **Update Authorization:** Only sellers can update carrier and tracking information for an order they fulfill.

## Integration Points
- **Incoming:** Triggered post-payment by the `order` domain.
- **Outgoing:** Provides tracking numbers and delivery status back to `order` and `escrow` to trigger fund releases.

## Public APIs
- No direct controllers in this package. Shipped via `OrderController`:
  `PUT /api/v1/orders/{order-id}/ship` with `{ "providerName": "<carrier>" }`; the provider assigns the tracking number.
