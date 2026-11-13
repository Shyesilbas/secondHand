# Forum UI Module

Community discussion boards, peer-to-peer marketplace advice threads, author anonymity controls, and interactive reaction streams.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`forum`](../../../src/main/java/com/serhat/secondhand/forum/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `forum` module powers the marketplace's community hub where buyers and sellers discuss trading tips, surface platform feedback, and seek advice. Key capabilities include:
1. **Categorized Discussion Feeds:** Topic filters (`SUGGESTIONS`, `COMPLAINTS`), status filters (`OPEN`, `IN_PROGRESS`, `RESOLVED`), and sorting modes (`NEW`, `TOP`).
2. **Author Anonymity & Privacy:** User-configurable author visibility settings (`ANONYMOUS` vs `DISPLAY_NAME`) allowing members to contribute candidly without linking questions to their marketplace storefront.
3. **Thread Detail & Comment Tree:** In-depth thread reader (`ThreadDetail`) with infinite-scrolling comment threads (`CommentItem`).
4. **Optimistic Reactions:** Instant thread and comment voting (Like / Dislike / Clear) with concurrency deduplication.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/forum` | `ForumPage` | Public |

| Embedded entry | Where |
|---|---|
| `ThreadComposerModal` | Modal dialog for authoring new discussion threads with title, category, and anonymity settings. |
| `ForumVisibilitySettingsModal` | User settings modal for selecting default profile visibility within forum interactions. |

## 3. Component Rules

- **Concurrency Guard:** `runExclusive` lock in `useForumThreads` ensures rapid clicks on status changes or publishing do not issue duplicate requests while in flight.
- **Anonymity Invariant:** When `authorVisibility === 'ANONYMOUS'`, the author's real username, avatar, and store links are replaced with a generic community alias.
- **Atomic Reactions:** A user can apply either `LIKE` or `DISLIKE`, or clear their vote; reaction state transitions update the UI optimistically before server confirmation.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['forum', 'comments', threadId]` | `useForumThread.js` |
| `['forum', 'thread', threadId]` | `useForumThread.js` |
| `['forum', 'threads', category, sort, search]` | `useForumThreads.js` |

| Invalidated / updated key | By |
|---|---|
| `['forum', 'comments', commentThreadId]` | `useForumThread.js` |
| `['forum', 'comments', threadId]` | `useForumThread.js` |
| `['forum', 'threads']` | `useForumThreads.js` |
| `['forum']` | `useForumThreads.js` |

## 5. Form & Data Validation Rules

- **Thread Title:** Minimum 5 characters, maximum 150 characters. Required string.
- **Thread Description:** Minimum 10 characters, maximum 5,000 characters. Trimmed before submission.
- **Category:** Must be one of `FORUM_CATEGORIES` (`SUGGESTIONS`, `COMPLAINTS`).
- **Comment Text:** Non-empty string up to 2,000 characters.
