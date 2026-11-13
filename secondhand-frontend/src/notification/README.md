# Notification UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`notification`](../../../src/main/java/com/serhat/secondhand/notification/README.md)
> - **Architecture Deep Dive:** [`docs/notification-feed-and-broadcast-architecture.md`](../../../docs/notification-feed-and-broadcast-architecture.md)

## 1. Executive Summary & Route Map

- `/notifications` redirects to `/inbox?tab=notifications` (`AppRoutes.jsx`); the UI renders inside `InboxPage`.

| Embedded entry | Where |
|---|---|
| `Protected` | No |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['notifications', 'feed', user?.id, view]` | `useNotificationFeed.js` |

| Invalidated / updated key | By |
|---|---|
| `['badgeCounts', user.id]` | `useInAppNotifications.js` |
| `['badgeCounts', user?.id]` | `useInAppNotifications.js` |
| `['notifications', 'feed']` | `useInAppNotifications.js` |
| `['notifications', user?.id]` | `useInAppNotifications.js` |
| `['notifications']` | `useInAppNotifications.js` |

## 3. Real-Time WebSocket

### Dual-Channel Delivery
- **Real-Time Push:** Subscribed to literal `/user/{userId}/notifications` (personal alerts) and `/topic/notifications` (system announcements) via STOMP.
- **REST Feed:** `GET /api/v1/notifications?page&size&unreadOnly` executes the hybrid native SQL projection (`findFeed`).

## 4. Notification Types & Navigation
`getNotificationTargetRoute` (`notificationConstants.js`) maps `NotificationType` to a route:
- `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `ORDER_COMPLETED`, `ORDER_REFUNDED` -> `/profile/orders` (with `orderId`).
- `ORDER_RECEIVED`, `LISTING_SOLD` -> `/profile/i-sold`.
- `PAYMENT_SUCCESS` -> listing detail, profile or `/ewallet` depending on metadata; `PAYMENT_FAILED` -> `/ewallet`.
- `AGREEMENT_UPDATED` -> `/agreements`; other types fall back to `actionUrl`.
