# Forum UI Module

Community discussion boards, peer-to-peer marketplace advice threads, author anonymity controls, and interactive reaction streams.

---

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

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/forum` | Public | `ForumPage` | Main discussion board. Query parameters support `category`, `status`, `sort`, and `search`. |
| In-Modal / Embedded | `ProtectedRoute` | `ThreadComposerModal` | Modal dialog for authoring new discussion threads with title, category, and anonymity settings. |
| In-Modal / Embedded | `ProtectedRoute` | `ForumVisibilitySettingsModal` | User settings modal for selecting default profile visibility within forum interactions. |

---

## 3. Component Hierarchy & Core Sub-Components

```
forum/
├── pages/
│   └── ForumPage.jsx                  # Two-pane or responsive feed + detail container
├── components/
│   ├── ThreadCard.jsx                 # Summary tile displaying category, votes, and author
│   ├── ThreadDetail.jsx               # Expanded thread viewer with body and comment editor
│   ├── CommentItem.jsx                # Individual comment bubble with reaction buttons
│   ├── ThreadComposerModal.jsx        # Dialog for publishing new threads
│   └── ForumVisibilitySettingsModal.jsx # Profile anonymity preference dialog
├── hooks/
│   ├── useForumThreads.js             # Feed query, filter state, publishing, and status changes
│   ├── useForumThread.js              # Single thread reader, comments query, and comment actions
│   ├── useForum.js                    # Composite hook aggregating thread operations
│   └── forumQueryUtils.js             # Reaction clamping and pagination utilities
├── services/
│   └── forumService.js                # REST client for /v1/forum endpoints
├── utils/
│   ├── forumDateFormat.js             # Localized relative timestamp helper
│   └── forumVisibilitySettings.js     # LocalStorage / user profile visibility cache
├── forumConstants.js                  # Categories, statuses, reactions, and error copy
└── index.js                           # Public exports
```

### Component Roles & Invariants
- **Concurrency Guard:** `runExclusive` lock in `useForumThreads` ensures rapid clicks on status changes or publishing do not issue duplicate requests while in flight.
- **Anonymity Invariant:** When `authorVisibility === 'ANONYMOUS'`, the author's real username, avatar, and store links are replaced with a generic community alias.
- **Atomic Reactions:** A user can apply either `LIKE` or `DISLIKE`, or clear their vote; reaction state transitions update the UI optimistically before server confirmation.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['forum', 'threads', category, sort, search]` | Filtered thread feed | 30 sec (`30000ms`) | 5 min (`300000ms`) | New thread published, status changed, or filter updated |
| `['forum', 'thread', threadId]` | Single thread details | 30 sec (`30000ms`) | 5 min (`300000ms`) | Status change or thread reaction |
| `['forum', 'comments', threadId]` | Paginated comment stream | 30 sec (`30000ms`) | 5 min (`300000ms`) | New comment submitted |

### Hooks Contract
- `useForumThreads()`: Exposes `{ threads, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage, category, setCategory, sort, setSort, search, setSearch, publishThread, changeThreadStatus, reactToThread }`.
- `useForumThread(threadId)`: Exposes `{ thread, comments, isThreadLoading, isCommentsLoading, addComment, reactToComment, isSubmittingComment }`.

---

## 5. Form & Data Validation Rules

- **Thread Title:** Minimum 5 characters, maximum 150 characters. Required string.
- **Thread Description:** Minimum 10 characters, maximum 5,000 characters. Trimmed before submission.
- **Category:** Must be one of `FORUM_CATEGORIES` (`SUGGESTIONS`, `COMPLAINTS`).
- **Comment Text:** Non-empty string up to 2,000 characters.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `ForumPage` renders skeleton thread cards in the left column and a skeleton article canvas in the right preview pane.
2. **Empty State:** Clean empty state container with `"No threads found"` (`FORUM_MESSAGES.NO_THREADS_FOUND`) and an invitation to start a new discussion.
3. **Error State:** Non-intrusive alert card displaying failure details with a retry action button.
4. **Data State:** Clean feed of thread cards with category badges, resolve status tags, vote tally badges, and comment counts.

### Backend Error Contract
- Handled via `useNotification` toasts and inline form feedback.
- Known codes:
  - `FORUM_THREAD_LOCKED`: Displayed when attempting to comment on a resolved/locked discussion.
  - `FORUM_UNAUTHORIZED`: Prompts unauthenticated guests to sign in before voting or commenting.

### Restrained Design Tokens
- **Category Badges:** Muted slate tokens (`bg-surface-alt text-muted-foreground border-border`) with subtle accent dot.
- **Status Tags:**
  - `OPEN`: Neutral badge.
  - `IN_PROGRESS`: Restrained amber badge (`bg-amber-500/10 text-amber-600 dark:text-amber-400`).
  - `RESOLVED`: Restrained emerald badge (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`).
- **Radii:** Strict `rounded-md` across cards, modals, and comment containers.
