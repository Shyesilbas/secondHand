# Shipping Domain

Manages cargo shipment records (`shippings` table, unique on `order_id`), carrier tracking numbers, and delivery status transitions (`ShippingStatus`: `PENDING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/safe-meetup-delivery-and-verification.md`](/docs/safe-meetup-delivery-and-verification.md) · [`docs/external-integrations-cloudinary-and-exchange.md`](/docs/external-integrations-cloudinary-and-exchange.md)
> - **Frontend Module:** [`secondhand-frontend/src/order/README.md`](/secondhand-frontend/src/order/README.md)
> - **Key Entry Points:** [`ShippingService`](application/ShippingService.java) · [`ShippingServiceImpl`](application/ShippingServiceImpl.java) · [`ShippingRepository`](repository/ShippingRepository.java) · [`ShippingMapper`](mapper/ShippingMapper.java)

## Business Rules & Invariants
- **One Shipment per Cargo Order:** `shippings` enforces `UNIQUE (order_id)`. When the verified seller ships an order (`PUT /api/v1/orders/{id}/ship`), `Order.markAsShipped` calls `Shipping.ship`, which records `provider_name`, `tracking_number`, `status = IN_TRANSIT`, `in_transit_at = now()` and a default `estimated_delivery_date` (+3 days); the order becomes `OrderStatus.SHIPPED`.
- **Delivery Handshake with Order & Escrow:** There is no carrier callback. `OrderCompletionScheduler` moves a `SHIPPED` order to `DELIVERED` after `STATUS_UPDATE_INTERVAL_MINUTES` from `in_transit_at`; `Order.markAsDelivered` calls `Shipping.markAsDelivered` (`ShippingStatus.DELIVERED`, `delivered_at`). This starts the buyer refund window (`OrderBusinessConstants.REFUND_WINDOW_HOURS`) and auto-completion timer (`AUTO_COMPLETION_HOURS`) before escrow release.
- **No Standalone Controller:** Shipping mutations are exposed through `OrderController` (`/api/v1/orders/{id}/ship`); supported carriers are served via `GET /api/v1/enums/all`.
