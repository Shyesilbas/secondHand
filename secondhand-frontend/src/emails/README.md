# Emails UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`email`](../../../src/main/java/com/serhat/secondhand/email/README.md)
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](../../../docs/email-architecture-and-event-driven-dispatch.md)

## 1. Executive Summary & Route Map
The `emails` module renders the user's dedicated in-app transactional email inbox. Because the marketplace intentionally avoids external SMTP relay dependencies in development and staging, all system notices, order confirmations, OTP codes, and bargaining updates are delivered to this mailbox.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/inbox?tab=emails` | `EmailsPage` | `Protected` | Yes | In-app email client inside the unified Inbox portal |
| `/emails` (direct) | `EmailsPage` | `Protected` | Yes | Direct mailbox route |

---

## 2. Component Hierarchy & File Structure

```
src/emails/
├── pages/
│   └── EmailsPage.jsx                  # Master-detail email client (message list + preview pane)
├── components/
│   ├── EmailListItem.jsx               # Email summary row (subject, sender, timestamp, read indicator)
│   └── EmailContent.jsx                # Full rendered HTML email content viewer with sanitization
├── services/
│   └── emailService.js                 # Raw Axios endpoints (/api/v1/emails/**)
├── emails.js                           # Formatters, email type label resolvers
├── emailConstants.js                   # Email categories, filter tabs, pagination defaults
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['emails', 'my', { page, size, types }]`: Paginated email messages.
- `['emails', 'unread-count']`: Unread email count for navbar badge.

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `markEmailAsRead` | `PATCH /api/v1/emails/{id}/read` | `['emails']` | Marks message read; decrements badge |
| `markAllAsRead` | `PATCH /api/v1/emails/read-all` | `['emails']` | Marks all emails read; resets badge to 0 |
| `deleteEmail` | `DELETE /api/v1/emails/{id}` | `['emails']` | Soft-deletes email from inbox |
| `deleteAllEmails` | `DELETE /api/v1/emails` | `['emails']` | Soft-deletes entire inbox |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Email list displays `<Skeleton>` rows matching sender/subject/date layout.
   - Preview pane displays skeleton header and body blocks.
2. **Empty State:**
   - Empty inbox: Displays an empty state with a mail icon: "Your inbox is completely empty."
   - No email selected: "Select an email from the left to read its contents."
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners if mailbox fetching fails.
4. **Disabled / Submitting State:**
   - "Delete" and "Mark Read" actions disable during active mutations.

---

## 5. Security & Content Sanitization
- Outbound transactional emails contain pre-rendered Thymeleaf HTML.
- `<EmailContent>` renders email bodies inside a sanitized container with restricted script execution, preventing Cross-Site Scripting (XSS).

---

## 6. Restrained Design Tokens & Anti-Patterns
- **Typography:** Timestamps use `font-mono tabular-nums text-xs text-text-muted`.
- **Email Badges:** System, Order, Offer, and Payment tags use neutral border pills (`border border-border-subtle`).
- **Zero Emojis:** Strictly prohibited across email subjects, previews, and mailbox filters.
- **Radius Ceiling:** Cards, message rows, and preview panes adhere strictly to `rounded-md`.
