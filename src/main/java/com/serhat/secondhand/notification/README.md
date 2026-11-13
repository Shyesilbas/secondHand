# Notification Domain

Delivers personal user alerts (`notifications` table) and zero-fan-out system broadcasts (`notification_events` + `notification_event_reads` tables) via a hybrid `UNION ALL` feed (`NotificationFeedRepository`), `AFTER_COMMIT` event listeners, and real-time STOMP WebSocket push (`NotificationWebSocketService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/notification-feed-and-broadcast-architecture.md`](/docs/notification-feed-and-broadcast-architecture.md) (hybrid `UNION ALL` feed query, broadcast read receipts, template catalog)
> - **Frontend Module:** [`secondhand-frontend/src/notification/README.md`](/secondhand-frontend/src/notification/README.md) · [`secondhand-frontend/src/inbox/README.md`](/secondhand-frontend/src/inbox/README.md)
> - **Key Entry Points:** [`NotificationController`](api/NotificationController.java) · [`NotificationService`](application/NotificationService.java) · [`INotificationService`](application/INotificationService.java) · [`NotificationWebSocketService`](application/NotificationWebSocketService.java) · [`NotificationEventPublisher`](application/NotificationEventPublisher.java) · [`NotificationTemplateCatalog`](template/NotificationTemplateCatalog.java)

## Business Rules & Invariants
- **Hybrid Personal + Broadcast Feed (`NotificationFeedRepository.findFeed`):** Combines personal rows (`notifications` where `user_id = :userId`) and broadcast rows (`notification_events` left-joined with `notification_event_reads` on `(event_id, user_id)`) via `UNION ALL`, avoiding $N$-row fan-out writes on broadcasts. `NotificationType.AGREEMENT_UPDATED` is excluded from the standard feed and unread counter (handled by the dedicated agreement modal).
- **Unread Count Formula (`NotificationService.getUnreadCount`):** `unreadPersonal + max(0, totalBroadcasts - userBroadcastReads)` (excluding `AGREEMENT_UPDATED`).
- **Read Receipts & Ownership (`NotificationErrorCodes`):** Marking a personal notification read verifies `notification.user.id == userId` (`NOTIFICATION_NOT_BELONGS_TO_USER`); marking a broadcast read inserts a `(event_id, user_id)` row into `notification_event_reads`.
- **Commit-Safe Async Dispatch:** Producers call `NotificationEventPublisher` (`publishDispatch` / `publishBroadcast`), handled by `NotificationDispatchRequestedEventListener` (`@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)` on `"notificationExecutor"`), so rolled-back transactions never send alerts.

## WebSocket & Caching
- STOMP destinations (`NotificationWebSocketService`): `/user/{userId}/notifications` (personal) and `/topic/notifications` (broadcast).
- Read mutations (`read`, `read-all`) evict Spring cache `user:badges` (`@CacheEvict(value = "user:badges", key = "#userId")`).

## API (`NotificationController`, `/api/v1/notifications`)
- `GET /` — paginated unified personal + broadcast notification feed (`Page<NotificationDto>`).
- `GET /unread-count` — total unread notification count.
- `PUT /{id}/read` & `PUT /read-all` — mark one or all notifications as read.
