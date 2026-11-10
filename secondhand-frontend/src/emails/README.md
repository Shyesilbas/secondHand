# Emails UI Module

In-app system email mailbox, automated transaction receipts, and email status management.

## Architecture

- **`EmailsPage`:** Mailbox interface rendered either standalone or embedded within `InboxPage` under `?tab=emails`. Supports paginated message navigation, search, and bulk operations.
- **`EmailListItem`:** Row component presenting sender, subject preview, timestamp, and read/unread status indicators.
- **`EmailContent`:** Message detail pane rendering sanitized HTML or formatted text for receipts, order confirmations, and security notifications.
- **`emailService`:** API service managing system mailbox operations:
  - Fetches paginated emails (`/v1/emails/my-emails`) and unread count (`/v1/emails/unread-count`).
  - Marks individual or all emails as read (`/v1/emails/{id}/read`, `/v1/emails/read-all`).
  - Deletes individual or all emails (`/v1/emails/{id}`, `/v1/emails`).

## Invariants

- **Unread Badge Synchronization:** Marking an email as read invalidates `['emails', 'unread-count']` and user badge queries immediately.
- **HTML Sanitization:** Email content rendering is safely constrained to prevent XSS from unexpected server-rendered email markup.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean two-pane layout, subtle unread indicator dots, and zero emojis.

