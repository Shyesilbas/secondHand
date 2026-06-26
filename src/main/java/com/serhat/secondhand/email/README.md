# Email Domain

## Purpose
The `email` domain manages the creation, rendering, transmission, and persistent tracking of all system-generated email notifications.

## Architecture Overview
- **EmailService:** Renders HTML templates via Thymeleaf and logs all emails into the `Email` database table.
- **EmailController:** Provides a REST API for users to list, read, or soft-delete their received system emails from their inbox view.

## Business Invariants & Constraints
- **Auditability:** Every sent email MUST be recorded in the database with its `EmailType` and recipient.
- **Soft Deletion:** Emails deleted by users via the interface are marked with `deletedAt`, not permanently dropped.

## State Machines
- **Email State:** Unread -> Read (`readAt`) -> Deleted (`deletedAt`).

## Integration Points
- **Incoming:** Triggered by various domains (auth, order, offer, agreements) via internal service calls or events.
- **Outgoing:** Interacts with the external SMTP/Email gateway provider.

## Public APIs
- Inbox retrieval, Mark as read, Delete email.

## Related Knowledge
- *(No runbooks extracted; modifications usually involve adding new templates or EmailType enum values)*
