# Order Domain

Manages the post-checkout order lifecycle for cargo (`DeliveryMethod.CARGO`) and meetup (`DeliveryMethod.SAFE_MEETUP`) orders: policy-governed transitions, item-level compensation, scheduled completion/cancellation and outbox events.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/order-lifecycle-and-compensation-management.md`](/docs/order-lifecycle-and-compensation-management.md) (state machine diagram, cargo & compensation flows)
> - **Architecture Deep Dive:** [`docs/safe-meetup-delivery-and-verification.md`](/docs/safe-meetup-delivery-and-verification.md) (OTP/QR handshake & brute-force lock)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/order/README.md`](/secondhand-frontend/src/order/README.md)
> - **Key Entry Points:** [`OrderCreationService`](application/OrderCreationService.java) · [`OrderCompletionService`](application/OrderCompletionService.java) · [`OrderCancellationService`](application/OrderCancellationService.java) · [`OrderRefundService`](application/OrderRefundService.java) · [`OrderItemCompensationPlanner`](application/OrderItemCompensationPlanner.java) · [`OrderCompletionScheduler`](application/OrderCompletionScheduler.java) · [`OrderQueryService`](application/OrderQueryService.java)

## Business Rules & Invariants
- **Time Windows (`OrderBusinessConstants`):**
  - `STATUS_UPDATE_INTERVAL_MINUTES` (5m): `CONFIRMED` -> `PROCESSING` automatic transition.
  - `SHIP_DEADLINE_HOURS` (72h): unshipped cargo orders are auto-cancelled by `OrderCompletionScheduler`.
- **Banned seller (`BannedSellerOrderCancellationListener`):** after a `UserBannedEvent` commits, unshipped cargo orders whose every item belongs to that seller are cancelled and refunded (`OrderCancellationService.cancelForRestrictedSeller`, one transaction per order, cause `SELLER_RESTRICTED`). Mixed-seller and meetup orders keep their normal deadline paths.
  - `AUTO_COMPLETION_HOURS` (cargo after `DELIVERED`) / `MEETUP_AUTO_COMPLETION_HOURS` (meetup after `HANDOVER_CONFIRMED`): `OrderCompletionScheduler` completes the order and calls `EscrowService.releaseEscrowForOrder`.
  - `REFUND_WINDOW_HOURS` (48h): buyer refund window after `DELIVERED`, strictly before escrow release.
- **Safe Meetup Handshake:** `MEETUP_PENDING` orders verify via 6-digit SHA-256 OTP or QR (valid `MEETUP_CODE_TTL_MINUTES`) (`verifyMeetup` -> `HANDOVER_CONFIRMED`); 3 failed attempts trigger a 15-minute `VERIFICATION_LOCKED` cooldown.
- **Synchronous Itemized Compensation (`OrderItemCompensationPlanner` & `OrderCompensationPersistenceService`):**
  - **Cancel (`OrderCancellationPolicy`):** Allowed in `OrderStatus.CANCELLABLE_STATUSES` (`PENDING`, `CONFIRMED`, `MEETUP_PENDING`). Writes `order_item_cancels`, refunds escrow to buyer, restores Redis/DB stock, and enqueues `order.cancelled.v1`.
  - **Refund (`OrderRefundPolicy`):** Allowed in `DELIVERED` within `REFUND_WINDOW_HOURS`. Writes `order_item_refunds`, calls `EscrowService.refund`, and enqueues `order.refunded.v1`.
- **Campaign Attribution (`OrderCreationService`):** Each `OrderItem` snapshots `campaignId`, `campaignName`, `originalUnitPrice` and line `campaignDiscount` from the checkout pricing, so a later campaign rename or delete never changes order history. No campaign means `campaignId = null` and discount zero; older rows keep these null (not recorded).
- **Viewer state (`OrderViewPolicy`):** reads add `allowedActions` and deadlines from endpoint policies; seller views add escrow-based `sellerTotal` and drop order-level money.
- **Change rule:** State rules live in the `Order` entity and `policy` classes, never in services or the frontend; update `OrderViewPolicy` with them. No event is emitted when a policy rejects the transition.
- **Change rule:** Cancellation/refund is planned per item (`OrderItemCompensationPlanner`) in `OrderCancellationService` / `OrderRefundService`; `order` decides, `payment` moves the money.

## Redis, Outbox & Kafka
- Outbox table `order_outbox_events`, polled by `OrderOutboxWorker` -> topics `order.cancelled.v1` (`OrderCancelledKafkaEvent`) and `order.refunded.v1` (`OrderRefundedKafkaEvent`). Compensation itself runs synchronously in the transaction.

## API (`OrderController`, `/api/v1/orders`)
- **Buyer:** `POST /checkout` · `GET /` (paginated) · `GET /status-counts` · `GET /{id}` · `PUT /{id}/cancel` · `POST /{id}/refund` · `PUT /{id}/complete` · `PUT /{id}/address` · `PUT /{id}/notes`.
- **Seller:** `GET /seller` · `GET /seller/status-counts` · `GET /seller/{id}` · `GET /seller/pending-escrow-amount` · `PUT /{id}/ship` (`OrderShipRequest`).
- **Meetup:** `POST /{orderNumber}/verify-meetup` · `POST /{orderNumber}/confirm-handover-completion` · `POST /{orderNumber}/regenerate-meetup-code`.
