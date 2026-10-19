# Forum Domain

## Purpose
The `forum` domain manages community discussions, Q&A topics, user advice threads, moderation workflows, and user engagement reactions for the marketplace platform.

## Architecture Overview
- **Thread & Comment Hierarchy:** `ForumThread` holds root topics categorized by domain (`ForumCategory`), supporting nested replies via `ForumComment`.
- **Author Privacy:** `ForumAuthorVisibility` allows users to post either publicly with their profile or anonymously (`ANONYMOUS`) to protect user identity when asking sensitive pricing or advice questions.
- **Reaction System:** `ForumThreadReaction` and `ForumCommentReaction` support atomic upvoting, downvoting, and helpful marks (`ForumReactionType`) with unique constraints per user.
- **Content Analysis:** `KeywordEngine` parses titles and content to extract searchable tags and trending topics.

## Business Invariants & Constraints
- **Thread Status Controls:**
  - `OPEN`: Standard active thread open to replies.
  - `CLOSED`: Thread archived by author or moderator; no new comments allowed.
  - `LOCKED`: Administrative lock due to disputes or policy violations.
  - `PINNED`: Sticky announcements positioned at the top of category feeds.
- **Single Active Reaction:** A user can have at most one active reaction per thread or comment. Submitting the same reaction toggles/removes it; submitting a different reaction updates the type atomically.
- **Validation:** `ForumValidator` enforces minimum character limits, category validity, and profanity/spam restrictions.

## Public APIs
- `GET /api/v1/forum/threads`: Paginated thread listing with sorting (`LATEST`, `POPULAR`, `MOST_COMMENTED`) and category filtering.
- `GET /api/v1/forum/threads/{id}`: Detailed thread view including author details (if public), tags, and view count increment.
- `POST /api/v1/forum/threads`: Creates a new discussion thread.
- `POST /api/v1/forum/threads/{id}/comments`: Adds a comment or nested reply to a thread.
- `POST /api/v1/forum/threads/{id}/react`: Adds or toggles a user reaction on a thread.
- `POST /api/v1/forum/comments/{id}/react`: Adds or toggles a user reaction on a comment.
