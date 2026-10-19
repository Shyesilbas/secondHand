# Notification Domain

## Purpose
The `notification` domain delivers real-time transactional alerts, system-wide broadcast announcements, and unread badge tracking across web and mobile interfaces.

## Architecture Overview
- **Hybrid Feed Architecture:** Combines personal notifications (`Notification`) and broadcast system announcements (`NotificationEvent`) without duplicating rows per user.
- **Unified Projection:** `NotificationFeedRepository` executes a union query across personal and broadcast tables, computing `isRead` dynamically via `NotificationEventRead`.
- **Real-Time Push:** `NotificationWebSocketService` pushes instant messages to user-specific queues (`/user/{userId}/queue/notifications`) and public broadcast topics (`/topic/notifications.broadcast`).
- **Template System:** `NotificationTemplateCatalog` provides standardized title, body, and action URL formats for domain events.

## Business Invariants & Constraints
- **Fan-Out Prevention:** Broadcast events are saved as a single entity; individual user reads are stored as lightweight `(userId, eventId)` tuples.
- **Cache Invalidation:** Any read mutation explicitly evicts the `user:badges` cache key for the target user.
- **Ownership Verification:** Users can only mark notifications assigned to their own user ID as read.

## Integration Points
- **Incoming:** Domain events consumed via `NotificationDispatchRequestedEventListener` and `NotificationBroadcastRequestedEvent`.
- **Outgoing:** STOMP WebSocket messages dispatched via Spring's `SimpMessagingTemplate`.

## Public APIs
- `GET /api/v1/notifications`: Paginated feed of combined personal and broadcast notifications.
- `GET /api/v1/notifications/unread-count`: Combined count of unread personal and unread broadcast messages.
- `PUT /api/v1/notifications/{id}/read`: Marks a single notification or broadcast event as read.
- `PUT /api/v1/notifications/mark-all-read`: Marks all pending notifications as read for the authenticated user.
