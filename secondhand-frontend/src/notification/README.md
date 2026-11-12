# Notification UI Module

## 1. Executive Summary & Route Map
The `notification` module provides real-time transactional alert delivery, toast popups, unread badge counters, in-app notification drawers, and STOMP WebSocket push synchronization.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/inbox?tab=notifications` | `InboxNotificationsPanel` | `Protected` | Yes | Unified notification feed inside the Inbox portal |
| Global Trigger | `NotificationModal` | `Protected` | No | Header bell dropdown / slide-over dialog |

---

## 2. Component Hierarchy & File Structure

```
src/notification/
├── NotificationContext.jsx             # Flash toast notification context (showSuccess, showError)
├── NotificationProvider.jsx            # Toast rendering provider mounted at root App level
├── InAppNotificationContext.jsx        # In-app feed and unread badge context
├── InAppNotificationProvider.jsx       # Feed state provider wrapping authenticated routes
├── NotificationModal.jsx               # Quick-view drawer/modal launched from header bell icon
├── components/
│   ├── Toast.jsx                       # Individual dismissible toast banner with timeout progress
│   ├── NotificationRow.jsx             # Notification item with icon, timestamp, and action URL
│   └── InboxNotificationsPanel.jsx     # Full-page tabbed notification feed
├── hooks/
│   ├── useNotificationFeed.js          # Infinite scrolling query hook for combined notifications
│   ├── useNotificationWebSocket.js     # STOMP client listening to /user/{userId}/notifications
│   └── useInAppNotifications.js        # Unread count tracking and mark-as-read mutations
├── services/
│   └── notificationService.js          # Raw Axios endpoints (/api/v1/notifications/**)
├── notificationConstants.js            # Toast variants, notification icons, default timeouts
└── README.md                           # Module documentation
```

---

## 3. Real-Time WebSocket & React Query Data Flow

### 3.1 Dual-Channel Delivery
- **Real-Time Push:** Subscribed to literal `/user/{userId}/notifications` (personal alerts) and `/topic/notifications` (system announcements) via STOMP.
- **REST Feed:** `GET /api/v1/notifications?page&size&unreadOnly` executes the hybrid native SQL projection (`findFeed`).

### 3.2 Query Key Topology & Invalidation
- `['notifications', 'feed', { unreadOnly }]`: Unified notification feed.
- `['notifications', 'unread-count']`: Total unread badge count.

| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `markAsRead` | `PUT /api/v1/notifications/{id}/read` | `['notifications']` | Clears unread indicator on notification row |
| `markAllAsRead` | `PUT /api/v1/notifications/read-all` | `['notifications']` | Resets unread counter badge to 0 |
| Inbound WS Alert | WebSocket push | `['notifications']` | Appends alert to feed; increments badge |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Dropdown and Inbox panel render `<Skeleton>` rows matching notification preview shapes.
2. **Empty State:**
   - When no alerts exist, renders an empty state with a bell icon: "You have no notifications right now."
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners if feed fetching fails.
4. **Disabled / Submitting State:**
   - "Mark all as read" button enters a disabled state while mutation is in flight.

---

## 5. Notification Types & Navigation
Defined in `NotificationType`:
- **Offers:** `OFFER_RECEIVED`, `OFFER_ACCEPTED`, `OFFER_REJECTED` -> Navigates to `/offers`.
- **Orders:** `ORDER_CREATED`, `ORDER_STATUS_CHANGED` -> Navigates to `/orders`.
- **Listings:** `LISTING_PRICE_DROPPED`, `LISTING_FAVORITED` -> Navigates to `/listings/:id`.
- **Legal:** `AGREEMENT_UPDATED` (filtered from normal feed; triggers legal modal).

---

## 6. Restrained Design Tokens & Anti-Patterns
- **Toast Styling:** Neutral background cards (`bg-surface-primary border border-border-subtle`) with subtle accent borders on the left edge.
- **Typography:** Timestamps use `font-mono tabular-nums text-xs text-text-muted`.
- **Zero Emojis:** Strictly prohibited across toast notifications, badge tags, and notification titles.
- **Radius Ceiling:** Toasts, rows, modals, and buttons adhere strictly to `rounded-md`.
