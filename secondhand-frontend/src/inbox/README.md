# Inbox UI Module

Unified communications dashboard combining system emails, push notifications, and real-time user-to-user chat.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`chat`](../../../src/main/java/com/serhat/secondhand/chat/README.md)
> - **Backend Module:** [`notification`](../../../src/main/java/com/serhat/secondhand/notification/README.md)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](../../../docs/websocket-stomp-and-chat-architecture.md)
> - **Architecture Deep Dive:** [`docs/notification-feed-and-broadcast-architecture.md`](../../../docs/notification-feed-and-broadcast-architecture.md)

## 1. Overview & Purpose

The `inbox` module provides a consolidated communication portal for marketplace members. Rather than fragmenting messages across multiple disconnected screens, it brings all correspondence into a single master layout:
1. **Multi-Channel Navigation:** Tabbed interface (`InboxPage`) coordinating three core messaging channels (`INBOX_TABS`):
   - `chat`: Real-time buyer-seller conversations, active negotiations, and embedded offer cards.
   - `notifications`: In-app system alerts, price drop notices, delivery updates, and follow events.
   - `emails`: Formal transactional emails, order invoices, and official platform dispatches.
2. **Deep-Link State Synchronization:** Synchronizes channel switching with the `?tab=` URL parameter, preserving browser history and shareable routes.
3. **Legacy Redirection:** Automatically intercepts visits to legacy `/chat` routes and redirects to `/inbox?tab=chat` while retaining room parameters (`?room={id}`).
4. **Live Badge Integration:** Surfaces unread message badges on each tab header driven by real-time WebSocket feeds and REST counts.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/inbox` | `InboxPage` | Protected |

## 3. Component Rules

- **Authentication Guard:** `ProtectedRoute` opens the login prompt (`useLoginPrompt`) for guests; cancelling returns to `/`.
- **Responsive Two-Pane Layout:** On desktop screens, renders a split pane with the channel navigation sidebar on the left and the active message channel on the right. On mobile screens, switches cleanly to full-width view with top navigation tabs.
- **Badge Synchronization:** Ingests unread counters from `notification` and `emails` modules to display real-time numeric badges on tab headers.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

- No queries defined in this module.

## 5. State Management

### URL State Machine
- `tab`: Synced to `useSearchParams()`.
  - `'chat'`: Mounts the chat subsystem and room selector.
  - `'notifications'`: Mounts the notifications list.
  - `'emails'`: Mounts the transactional mailbox viewer.

### Badge Counters
- Chat unread counts: Driven by active STOMP WebSocket room subscriptions.
- Notification unread counts: Ingests `['notifications', 'unreadCount']`.
- Email unread counts: Ingests `['emails', 'unreadCount']`.

## 6. Form & Data Validation Rules

- **Tab Parameter Validation:** If `?tab=` in the URL does not match one of `chat`, `notifications`, or `emails`, the page automatically defaults to `chat`.
