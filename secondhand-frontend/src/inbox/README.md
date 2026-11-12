# Inbox UI Module

Unified communications dashboard combining system emails, push notifications, and real-time user-to-user chat.

---

## 1. Overview & Purpose

The `inbox` module provides a consolidated communication portal for marketplace members. Rather than fragmenting messages across multiple disconnected screens, it brings all correspondence into a single master layout:
1. **Multi-Channel Navigation:** Tabbed interface (`InboxPage`) coordinating three core messaging channels (`INBOX_TABS`):
   - `chat`: Real-time buyer-seller conversations, active negotiations, and embedded offer cards.
   - `notifications`: In-app system alerts, price drop notices, delivery updates, and follow events.
   - `emails`: Formal transactional emails, order invoices, and official platform dispatches.
2. **Deep-Link State Synchronization:** Synchronizes channel switching with the `?tab=` URL parameter, preserving browser history and shareable routes.
3. **Legacy Redirection:** Automatically intercepts visits to legacy `/chat` routes and redirects to `/inbox?tab=chat` while retaining room parameters (`?room={id}`).
4. **Live Badge Integration:** Surfaces unread message badges on each tab header driven by real-time WebSocket feeds and REST counts.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/inbox` | `ProtectedRoute` | `InboxPage` | Master communications center. Query parameter `?tab=chat\|notifications\|emails` determines the active view. |
| `/chat` | `ProtectedRoute` | Redirect | Legacy route immediately forwarded to `/inbox?tab=chat` (preserves `?room={id}`). |

---

## 3. Component Hierarchy & Core Sub-Components

```
inbox/
├── pages/
│   └── InboxPage.jsx                  # Master communications layout coordinating tabs
├── inboxConstants.js                  # Tab identifiers (INBOX_TABS) and navigation mappings
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **Authentication Guard:** Access requires an active user session; unauthenticated visits redirect to `/login` with `returnUrl`.
- **Responsive Two-Pane Layout:** On desktop screens, renders a split pane with the channel navigation sidebar on the left and the active message channel on the right. On mobile screens, switches cleanly to full-width view with top navigation tabs.
- **Badge Synchronization:** Ingests unread counters from `notification` and `emails` modules to display real-time numeric badges on tab headers.

---

## 4. State Management & React Query Contract

### URL State Machine
- `tab`: Synced to `useSearchParams()`.
  - `'chat'`: Mounts the chat subsystem and room selector.
  - `'notifications'`: Mounts the notifications list.
  - `'emails'`: Mounts the transactional mailbox viewer.

### Badge Counters
- Chat unread counts: Driven by active STOMP WebSocket room subscriptions.
- Notification unread counts: Ingests `['notifications', 'unreadCount']`.
- Email unread counts: Ingests `['emails', 'unreadCount']`.

---

## 5. Form & Data Validation Rules

- **Tab Parameter Validation:** If `?tab=` in the URL does not match one of `chat`, `notifications`, or `emails`, the page automatically defaults to `chat`.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Renders a clean split-pane skeleton with placeholder tab headers and an animated content panel.
2. **Empty State:** Delegated to the active child channel (`ChatPage`, notifications feed, or `EmailsPage`).
3. **Error State:** Surfaces inline retry alert if channel metadata fails to load.
4. **Data State:** Unified communications portal with active tab indicators, unread count pill badges, and seamless switching between conversations and system notices.

### Backend Error Contract
- Network errors during tab content loading are handled gracefully by child module error boundaries without breaking the parent `InboxPage` shell.

### Restrained Design Tokens
- **Tab Indicators:** Active tabs use subtle background highlights (`bg-surface-alt text-foreground font-medium border-b-2 border-primary`); inactive tabs use muted text (`text-muted-foreground hover:text-foreground`).
- **Unread Badges:** Compact pill badges (`bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full`).
- **Dividers:** Clean hairline borders (`border-border`) between channels.
