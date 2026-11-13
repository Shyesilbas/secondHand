# Emails UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`email`](../../../src/main/java/com/serhat/secondhand/email/README.md)
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](../../../docs/email-architecture-and-event-driven-dispatch.md)

## 1. Executive Summary & Route Map

- `/emails` redirects to `/inbox?tab=emails` (`AppRoutes.jsx`); the UI renders inside `InboxPage`.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['emails', 'my', user?.id, page, filterType]` | `EmailsPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['badgeCounts', user?.id]` | `EmailsPage.jsx` |
| `['emails', 'my', user?.id, page, filterType]` | `EmailsPage.jsx` |
| `['emails', 'my', user?.id]` | `EmailsPage.jsx` |

## 3. Security & Content Sanitization
- Outbound transactional emails contain pre-rendered Thymeleaf HTML.
- `<EmailContent>` renders email bodies inside a sanitized container with restricted script execution, preventing Cross-Site Scripting (XSS).
