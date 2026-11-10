# Inbox UI Module

Unified communications dashboard combining system emails, notifications, and user-to-user chat.

## Architecture

- **`InboxPage`:** Master communications view (`/inbox`) unifying three communication channels within a tabbed interface (`INBOX_TABS` in `inboxConstants.js`):
  - `emails`: System messages, receipts, and order updates rendered via embedded `EmailsPage`.
  - `notifications`: Push and activity events displayed via `InboxNotificationsPanel`.
  - `chat`: Real-time buyer-seller conversations rendered via embedded `ChatPage`.
- **Navigation Coordination:** Synchronizes active channel selection via the `?tab=` URL search parameter, preserving bookmarkability and deep-link routing.
- **Legacy Route Redirection:** The legacy `/chat` path automatically redirects to `/inbox?tab=chat`, preserving room query parameters (`?room={id}`).

## Invariants

- **Protected Route:** Access is gated behind `ProtectedRoute`; unauthenticated visitors are redirected to `/login`.
- **Badge Integration:** Tabs render real-time unread badges derived from chat unread counts and email unread counts.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean two-pane layout, subtle active indicators, hairline borders, and zero emojis.

